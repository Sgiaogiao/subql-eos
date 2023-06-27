// Copyright 2020-2022 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import {getManifestPath, loadFromJsonOrYaml} from '@subql/common';
import {plainToClass} from 'class-transformer';
import {validateSync} from 'class-validator';
import {ChainTypes} from './models';
import {EosProjectManifestVersioned, VersionedProjectManifest} from './versioned';

export function parseEosProjectManifest(raw: unknown): EosProjectManifestVersioned {
  const projectManifest = new EosProjectManifestVersioned(raw as VersionedProjectManifest);
  projectManifest.validate();
  return projectManifest;
}

export function loadEosProjectManifest(file: string): EosProjectManifestVersioned {
  const doc = loadFromJsonOrYaml(getManifestPath(file));
  const projectManifest = new EosProjectManifestVersioned(doc as VersionedProjectManifest);
  projectManifest.validate();
  return projectManifest;
}

// 此部分意义不明，后续留待研究
export function parseChainTypes(raw: unknown): ChainTypes {
  const chainTypes = plainToClass(ChainTypes, raw);
  if (
    !!chainTypes.types ||
    !!chainTypes.typesChain ||
    !!chainTypes.typesBundle ||
    !!chainTypes.typesAlias ||
    !!chainTypes.typesSpec
  ) {
    const errors = validateSync(chainTypes, {whitelist: true, forbidNonWhitelisted: true});
    if (errors?.length) {
      // TODO: print error details
      const errorMsgs = errors.map((e) => e.toString()).join('\n');
      throw new Error(`failed to parse chain types.\n${errorMsgs}`);
    }
    return chainTypes;
  } else {
    throw new Error(`chainTypes is not valid`);
  }
}
