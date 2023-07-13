// Copyright 2020-2022 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import {IProjectManifest, ProjectNetworkConfig} from '@subql/common';
import {EosDatasource} from '@subql/types';
import {RuntimeDataSourceV0_0_1} from '../project/versioned/v0_0_1';

// All of these used to be redefined in this file, re-exporting for simplicity
export {
  EosRuntimeHandler,
  EosCustomHandler,
  EosHandler,
  EosHandlerKind,
  EosDatasource as EosDataSource,
  EosCustomDatasource as EosCustomDataSource,
  EosBlockFilter,
  EosCallFilter,
  EosEventFilter,
  EosDatasourceProcessor,
  EosNetworkFilter,
  EosRuntimeHandlerFilter,
  EosDatasourceKind,
  RuntimeHandlerInputMap as EosRuntimeHandlerInputMap,
} from '@subql/types';

//make exception for runtime datasource 0.0.1
export type IEosProjectManifest = IProjectManifest<EosDatasource | RuntimeDataSourceV0_0_1>;

export interface EosProjectNetworkConfig extends ProjectNetworkConfig {
  genesisHash?: string;
  chainId?: string;
}
