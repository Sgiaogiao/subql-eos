// Copyright 2020-2022 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import {RegisteredTypes} from '@polkadot/types/types';
import {BaseMapping, IProjectManifest} from '@subql/common';
import {
  EosRuntimeDatasource,
  EosNetworkFilter,
  EosRuntimeHandlerFilter,
  EosRuntimeHandler,
  EosDatasourceKind,
} from '@subql/types';
import {EosProjectNetworkConfig} from '../../types';

export type ProjectNetworkConfigV0_0_1 = EosProjectNetworkConfig & RegisteredTypes;

// export interface RuntimeDataSourceV0_0_1 extends EosRuntimeDataSource {
//   name: string;
//   filter?: EosNetworkFilter;
// }

export type ManifestV0_0_1Mapping = Omit<BaseMapping<EosRuntimeHandlerFilter, EosRuntimeHandler>, 'file'>;

export interface RuntimeDataSourceV0_0_1 extends Omit<EosRuntimeDatasource, 'mapping'> {
  name: string;
  filter?: EosNetworkFilter;
  kind: EosDatasourceKind.Runtime;
  mapping: ManifestV0_0_1Mapping;
}

export interface ProjectManifestV0_0_1 extends IProjectManifest<RuntimeDataSourceV0_0_1> {
  schema: string;
  network: ProjectNetworkConfigV0_0_1;
}
