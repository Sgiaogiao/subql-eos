// Copyright 2020-2022 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import {DataTypes} from '@subql/x-sequelize';
import {TypeClass} from '../TypeClass';

export const Float = new TypeClass(
  'Float',
  (data: number): Uint8Array => {
    //TODO, check if this is proper way to handle float
    return Buffer.from(data.toString());
  },
  'number',
  'Float',
  DataTypes.FLOAT
);
