// Copyright 2020-2022 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

// 波卡独有，是否需要保留？
import {RegisteredTypes, RegistryTypes, OverrideModuleType, OverrideBundleType} from '@polkadot/types/types';

import {BaseMapping, FileReference} from '@subql/common';
import {
  CustomDataSourceAsset as EosCustomDataSourceAsset,
  EosBlockFilter,
  SubstrateBlockHandler,
  SubstrateCallFilter,
  SubstrateCallHandler,
  SubstrateCustomHandler,
  SubstrateDatasourceKind,
  SubstrateEventFilter, //1
  SubstrateEventHandler,
  SubstrateHandlerKind,
  EosNetworkFilter,
  EosRuntimeDatasource,
  SubstrateRuntimeHandler,
  SubstrateRuntimeHandlerFilter,
  EosCustomDatasource,
} from '@subql/types';
import {plainToClass, Transform, Type} from 'class-transformer';
//  验证器，可以都放进去
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsObject,
  ValidateNested,
} from 'class-validator';

//2023.6.28 删掉了版本控制的部分
export class BlockFilter implements EosBlockFilter {
  // @IsOptional()
  // @IsArray()
  // @ArrayMaxSize(2)
  // specVersion?: [number, number];
  // 上面是波卡独有，下面是一样的，因为初始项目加入的版本控制的功能，所以要多一些代码内容，这些内容后面要删掉
  // 在project.ts中删掉了版本控制的部分，上面这些可以直接删掉了
  @IsOptional()
  @IsInt()
  modulo?: number;
  @IsOptional()
  @IsString()
  timestamp?: string;
}
//2023.6.28
// 在filter中event、call应该是可以拆开写，在eth中拆开了event call，cosmos拆开了call
// eos应该怎么做？这些与什么有关？
export class EventFilter extends BlockFilter implements SubstrateEventFilter {
  @IsOptional()
  @IsString()
  module?: string;
  @IsOptional()
  @IsString()
  method?: string;
}

// chaintype相关的内容可以删掉了
// export class ChainTypes implements RegisteredTypes {
//   @IsObject()
//   @IsOptional()
//   types?: RegistryTypes;
//   @IsObject()
//   @IsOptional()
//   typesAlias?: Record<string, OverrideModuleType>;
//   @IsObject()
//   @IsOptional()
//   typesBundle?: OverrideBundleType;
//   @IsObject()
//   @IsOptional()
//   typesChain?: Record<string, RegistryTypes>;
//   @IsObject()
//   @IsOptional()
//   typesSpec?: Record<string, RegistryTypes>;
// }

export class CallFilter extends EventFilter implements SubstrateCallFilter {
  @IsOptional()
  @IsBoolean()
  success?: boolean;
}

export class BlockHandler implements SubstrateBlockHandler {
  @IsOptional()
  @ValidateNested()
  @Type(() => BlockFilter)
  filter?: EosBlockFilter;
  @IsEnum(SubstrateHandlerKind, {groups: [SubstrateHandlerKind.Block]})
  kind: SubstrateHandlerKind.Block;
  @IsString()
  handler: string;
}

export class CallHandler implements SubstrateCallHandler {
  @IsOptional()
  @ValidateNested()
  @Type(() => CallFilter)
  filter?: SubstrateCallFilter;
  @IsEnum(SubstrateHandlerKind, {groups: [SubstrateHandlerKind.Call]})
  kind: SubstrateHandlerKind.Call;
  @IsString()
  handler: string;
}

export class EventHandler implements SubstrateEventHandler {
  @IsOptional()
  @ValidateNested()
  @Type(() => EventFilter)
  filter?: SubstrateEventFilter;
  @IsEnum(SubstrateHandlerKind, {groups: [SubstrateHandlerKind.Event]})
  kind: SubstrateHandlerKind.Event;
  @IsString()
  handler: string;
}

export class CustomHandler implements SubstrateCustomHandler {
  @IsString()
  kind: string;
  @IsString()
  handler: string;
  @IsObject()
  @IsOptional()
  filter?: Record<string, unknown>;
}

export class RuntimeMapping implements BaseMapping<SubstrateRuntimeHandlerFilter, SubstrateRuntimeHandler> {
  @Transform((params) => {
    const handlers: SubstrateRuntimeHandler[] = params.value;
    return handlers.map((handler) => {
      switch (handler.kind) {
        case SubstrateHandlerKind.Event:
          return plainToClass(EventHandler, handler);
        case SubstrateHandlerKind.Call:
          return plainToClass(CallHandler, handler);
        case SubstrateHandlerKind.Block:
          return plainToClass(BlockHandler, handler);
        default:
          throw new Error(`handler ${(handler as any).kind} not supported`);
      }
    });
  })
  @IsArray()
  @ValidateNested()
  handlers: SubstrateRuntimeHandler[];
  @IsString()
  file: string;
}

export class CustomMapping implements BaseMapping<Record<string, unknown>, SubstrateCustomHandler> {
  @IsArray()
  @Type(() => CustomHandler)
  @ValidateNested()
  handlers: CustomHandler[];
  @IsString()
  file: string;
}

export class SubqlNetworkFilterImpl implements EosNetworkFilter {
  @IsString()
  @IsOptional()
  specName?: string;
}

export class RuntimeDataSourceBase implements EosRuntimeDatasource {
  @IsEnum(SubstrateDatasourceKind, {groups: [SubstrateDatasourceKind.Runtime]})
  kind: SubstrateDatasourceKind.Runtime;
  @Type(() => RuntimeMapping)
  @ValidateNested()
  mapping: RuntimeMapping;
  @IsOptional()
  @IsInt()
  startBlock?: number;
  @IsOptional()
  @ValidateNested()
  @Type(() => SubqlNetworkFilterImpl)
  filter?: EosNetworkFilter;
}

export class FileReferenceImpl implements FileReference {
  @IsString()
  file: string;
}

export class CustomDataSourceBase<K extends string, T extends EosNetworkFilter, M extends CustomMapping, O = any>
  implements EosCustomDatasource<K, T, M, O>
{
  @IsString()
  kind: K;
  @Type(() => CustomMapping)
  @ValidateNested()
  mapping: M;
  @IsOptional()
  @IsInt()
  startBlock?: number;
  @Type(() => FileReferenceImpl)
  @ValidateNested({each: true})
  assets: Map<string, EosCustomDataSourceAsset>;
  @Type(() => FileReferenceImpl)
  @IsObject()
  processor: FileReference;
  @IsOptional()
  @IsObject()
  filter?: T;
}
