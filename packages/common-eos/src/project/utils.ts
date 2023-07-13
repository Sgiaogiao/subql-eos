// Copyright 2020-2022 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import {
  SecondLayerHandlerProcessor,
  EosCustomDatasource,
  EosDatasource,
  EosDatasourceKind,
  EosHandlerKind,
  EosNetworkFilter,
  EosRuntimeDatasource,
} from '@subql/types';
import {gte} from 'semver';
import {CustomDatasourceTemplate, RuntimeDatasourceTemplate} from '../project/versioned';

export function isBlockHandlerProcessor<T extends EosNetworkFilter, E>(
  hp: SecondLayerHandlerProcessor<EosHandlerKind, T, unknown>
): hp is SecondLayerHandlerProcessor<EosHandlerKind.Block, T, E> {
  return hp.baseHandlerKind === EosHandlerKind.Block;
}

export function isEventHandlerProcessor<T extends EosNetworkFilter, E>(
  hp: SecondLayerHandlerProcessor<EosHandlerKind, T, unknown>
): hp is SecondLayerHandlerProcessor<EosHandlerKind.Event, T, E> {
  return hp.baseHandlerKind === EosHandlerKind.Event;
}

export function isCallHandlerProcessor<T extends EosNetworkFilter, E>(
  hp: SecondLayerHandlerProcessor<EosHandlerKind, T, unknown>
): hp is SecondLayerHandlerProcessor<EosHandlerKind.Call, T, E> {
  return hp.baseHandlerKind === EosHandlerKind.Call;
}

export function isCustomDs<F extends EosNetworkFilter>(ds: EosDatasource): ds is EosCustomDatasource<string, F> {
  return ds.kind !== EosDatasourceKind.Runtime && !!(ds as EosCustomDatasource<string, F>).processor;
}

export function isRuntimeDs(ds: EosDatasource): ds is EosRuntimeDatasource {
  return ds.kind === EosDatasourceKind.Runtime;
}

export function isEosTemplates(
  templatesData: any,
  specVersion: string
): templatesData is (RuntimeDatasourceTemplate | CustomDatasourceTemplate)[] {
  return (isRuntimeDs(templatesData[0]) || isCustomDs(templatesData[0])) && gte(specVersion, '0.2.1');
}
