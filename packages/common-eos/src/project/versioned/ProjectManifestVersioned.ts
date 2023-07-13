// Copyright 2020-2022 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import {EosDatasource} from '@subql/types';
import {plainToClass} from 'class-transformer';
import {IEosProjectManifest} from '../types';
import {ProjectManifestV0_0_1Impl, RuntimeDataSourceV0_0_1} from './v0_0_1';
export type VersionedProjectManifest = {specVersion: string};

/* Retain support for all versions here to continue support for migrations */
// 版本控制，具体实现最后再确定
const EOS_SUPPORTED_VERSIONS = {
  '0.0.1': ProjectManifestV0_0_1Impl, //待确定
};

type Versions = keyof typeof EOS_SUPPORTED_VERSIONS;

type ProjectManifestImpls = InstanceType<typeof EOS_SUPPORTED_VERSIONS[Versions]>;

export function manifestIsV0_0_1(manifest: IEosProjectManifest): manifest is ProjectManifestV0_0_1Impl {
  return manifest.specVersion === '0.0.1';
}

export class EosProjectManifestVersioned implements IEosProjectManifest {
  [x: string]: any;
  private _impl: ProjectManifestImpls;

  constructor(projectManifest: VersionedProjectManifest) {
    const klass = EOS_SUPPORTED_VERSIONS[projectManifest.specVersion as Versions];
    if (!klass) {
      throw new Error('specVersion not supported for project manifest file');
    }
    this._impl = plainToClass<ProjectManifestImpls, VersionedProjectManifest>(klass, projectManifest);
  }

  get asImpl(): ProjectManifestImpls {
    return this._impl;
  }

  get isV0_0_1(): boolean {
    return this.specVersion === '0.0.1';
  }

  get asV0_0_1(): ProjectManifestV0_0_1Impl {
    return this._impl as ProjectManifestV0_0_1Impl;
  }

  toDeployment(): string | undefined {
    return this._impl.toDeployment();
  }

  validate(): void {
    return this._impl.validate();
  }

  get dataSources(): (EosDatasource | RuntimeDataSourceV0_0_1)[] {
    return this._impl.dataSources;
  }

  get schema(): string {
    if (manifestIsV0_0_1(this._impl)) {
      return this._impl.schema;
    }

    return this.ProjectManifestV0_0_1Impl.schema.file;
  }

  get specVersion(): string {
    return this._impl.specVersion;
  }

  get description(): string {
    return this._impl.description;
  }

  get repository(): string {
    return this._impl.repository;
  }
}
