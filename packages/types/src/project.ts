// Copyright 2020-2022 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import {ApiPromise} from '@polkadot/api';
import {AnyTuple, RegistryTypes} from '@polkadot/types/types';
import {SubstrateBlock, SubstrateEvent, SubstrateExtrinsic} from './interfaces';

export enum EosDatasourceKind {
  Runtime = 'eos/Runtime',
}

export enum EosHandlerKind {
  Block = 'eos/BlockHandler',
  Call = 'eos/CallHandler',
  Event = 'eos/EventHandler',
}

export type RuntimeHandlerInputMap<T extends AnyTuple = AnyTuple> = {
  [EosHandlerKind.Block]: SubstrateBlock;
  [EosHandlerKind.Event]: SubstrateEvent<T>;
  [EosHandlerKind.Call]: SubstrateExtrinsic<T>;
};

type RuntimeFilterMap = {
  [EosHandlerKind.Block]: EosNetworkFilter;
  [EosHandlerKind.Event]: EosEventFilter;
  [EosHandlerKind.Call]: EosCallFilter;
};

export interface ProjectManifest {
  specVersion: string;
  description: string;
  repository: string;

  schema: string;

  network: {
    endpoint: string;
    customTypes?: RegistryTypes;
  };

  bypassBlocks?: number[];
  dataSources: EosDatasource[];
}

// [startSpecVersion?, endSpecVersion?] closed range
// eos不需要版本控制，写一个版本即可
// export type SpecVersionRange = [number, number];

// interface SubstrateBaseHandlerFilter {
//   specVersion?: SpecVersionRange;
// }

//初始项目的一些文件与eth有所区别，个人认为后面还是要根据eth、cosmos这些扩展链的代码构造来写
//cosmos与eth也有一些区别，eth的写法应该更标准一些
//这个接口多了一个继承关系，而且波卡项目的继承关系明显要多余其他扩展链，大多都是用于版本控制的
//这里的版本控制可以去掉
// export interface SubstrateBlockFilter extends SubstrateBaseHandlerFilter {
//   modulo?: number;
//   timestamp?: string;
// }
export interface EosBlockFilter {
  modulo?: number;
  timestamp?: string;
}

// export interface SubstrateEventFilter extends SubstrateBaseHandlerFilter {
//   module?: string;
//   method?: string;
// }
export interface EosEventFilter {
  module?: string;
  method?: string;
}

export interface EosCallFilter extends EosEventFilter {
  success?: boolean;
}

export type EosBlockHandler = EosCustomHandler<EosHandlerKind.Block, EosBlockFilter>;
export type EosCallHandler = EosCustomHandler<EosHandlerKind.Call, EosCallFilter>;
export type EosEventHandler = EosCustomHandler<EosHandlerKind.Event, EosEventFilter>;

export interface EosCustomHandler<K extends string = string, F = Record<string, unknown>> {
  handler: string;
  kind: K;
  filter?: F;
}

export type EosRuntimeHandler = EosBlockHandler | EosCallHandler | EosEventHandler;
export type EosHandler = EosRuntimeHandler | EosCustomHandler<string, unknown>;
export type EosRuntimeHandlerFilter = EosBlockFilter | EosCallFilter | EosEventFilter;

export interface EosMapping<T extends EosHandler = EosHandler> extends FileReference {
  handlers: T[];
}

interface ISubstrateDatasource<M extends EosMapping, F extends EosNetworkFilter = EosNetworkFilter> {
  name?: string;
  kind: string;
  filter?: F;
  startBlock?: number;
  mapping: M;
}

export interface EosRuntimeDatasource<M extends EosMapping<EosRuntimeHandler> = EosMapping<EosRuntimeHandler>>
  extends ISubstrateDatasource<M> {
  kind: EosDatasourceKind.Runtime;
}

export interface EosNetworkFilter {
  specName?: string;
}

export type EosDatasource = EosRuntimeDatasource | EosCustomDatasource;

export interface FileReference {
  file: string;
}

export type CustomDataSourceAsset = FileReference;

export type Processor<O = any> = FileReference & {options?: O};

export interface EosCustomDatasource<
  K extends string = string,
  T extends EosNetworkFilter = EosNetworkFilter,
  M extends EosMapping = EosMapping<EosCustomHandler>,
  O = any
> extends ISubstrateDatasource<M, T> {
  kind: K;
  assets: Map<string, CustomDataSourceAsset>;
  processor: Processor<O>;
}

//export type SubstrateBuiltinDataSource = ISubstrateDatasource;

export interface HandlerInputTransformer_0_0_0<
  T extends EosHandlerKind,
  E,
  IT extends AnyTuple,
  DS extends EosCustomDatasource = EosCustomDatasource
> {
  (input: RuntimeHandlerInputMap<IT>[T], ds: DS, api: ApiPromise, assets?: Record<string, string>): Promise<E>; //  | SubstrateBuiltinDataSource
}

export interface HandlerInputTransformer_1_0_0<
  T extends EosHandlerKind,
  F,
  E,
  IT extends AnyTuple,
  DS extends EosCustomDatasource = EosCustomDatasource
> {
  (params: {
    input: RuntimeHandlerInputMap<IT>[T];
    ds: DS;
    filter?: F;
    api: ApiPromise;
    assets?: Record<string, string>;
  }): Promise<E[]>; //  | SubstrateBuiltinDataSource
}

type SecondLayerHandlerProcessorArray<
  K extends string,
  F extends EosNetworkFilter,
  T,
  IT extends AnyTuple = AnyTuple,
  DS extends EosCustomDatasource<K, F> = EosCustomDatasource<K, F>
> =
  | SecondLayerHandlerProcessor<EosHandlerKind.Block, F, T, IT, DS>
  | SecondLayerHandlerProcessor<EosHandlerKind.Call, F, T, IT, DS>
  | SecondLayerHandlerProcessor<EosHandlerKind.Event, F, T, IT, DS>;

export interface EosDatasourceProcessor<
  K extends string,
  F extends EosNetworkFilter,
  DS extends EosCustomDatasource<K, F> = EosCustomDatasource<K, F>,
  P extends Record<string, SecondLayerHandlerProcessorArray<K, F, any, any, DS>> = Record<
    string,
    SecondLayerHandlerProcessorArray<K, F, any, any, DS>
  >
> {
  kind: K;
  validate(ds: DS, assets: Record<string, string>): void;
  dsFilterProcessor(ds: DS, api: ApiPromise): boolean;
  handlerProcessors: P;
}

export interface DictionaryQueryCondition {
  field: string;
  value: string | string[];
  matcher?: string; // defaults to "equalTo", use "contains" for JSON
}

export interface DictionaryQueryEntry {
  entity: string;
  conditions: DictionaryQueryCondition[];
}

interface SecondLayerHandlerProcessorBase<
  K extends EosHandlerKind,
  F,
  DS extends EosCustomDatasource = EosCustomDatasource
> {
  baseHandlerKind: K;
  baseFilter: RuntimeFilterMap[K] | RuntimeFilterMap[K][];
  filterValidator: (filter?: F) => void;
  dictionaryQuery?: (filter: F, ds: DS) => DictionaryQueryEntry | undefined;
}

// only allow one custom handler for each baseHandler kind
export interface SecondLayerHandlerProcessor_0_0_0<
  K extends EosHandlerKind,
  F,
  E,
  IT extends AnyTuple = AnyTuple,
  DS extends EosCustomDatasource = EosCustomDatasource
> extends SecondLayerHandlerProcessorBase<K, F, DS> {
  specVersion: undefined;
  transformer: HandlerInputTransformer_0_0_0<K, E, IT, DS>;
  filterProcessor: (filter: F | undefined, input: RuntimeHandlerInputMap<IT>[K], ds: DS) => boolean;
}

export interface SecondLayerHandlerProcessor_1_0_0<
  K extends EosHandlerKind,
  F,
  E,
  IT extends AnyTuple = AnyTuple,
  DS extends EosCustomDatasource = EosCustomDatasource
> extends SecondLayerHandlerProcessorBase<K, F, DS> {
  specVersion: '1.0.0';
  transformer: HandlerInputTransformer_1_0_0<K, F, E, IT, DS>;
  filterProcessor: (params: {filter: F | undefined; input: RuntimeHandlerInputMap<IT>[K]; ds: DS}) => boolean;
}

export type SecondLayerHandlerProcessor<
  K extends EosHandlerKind,
  F,
  E,
  IT extends AnyTuple = AnyTuple,
  DS extends EosCustomDatasource = EosCustomDatasource
> = SecondLayerHandlerProcessor_0_0_0<K, F, E, IT, DS> | SecondLayerHandlerProcessor_1_0_0<K, F, E, IT, DS>;
