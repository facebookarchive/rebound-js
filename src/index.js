/**
 *  Copyright (c) 2013, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 */

import * as util from './util';
import * as MathUtil from './MathUtil';
import * as OrigamiValueConverter from './OrigamiValueConverter';
import * as Loopers from './Loopers';
import SpringConfig from './SpringConfig';
import SpringSystem from './SpringSystem';
import Spring from './Spring';

export default {
  ...Loopers,
  OrigamiValueConverter,
  MathUtil,
  Spring,
  SpringConfig,
  SpringSystem,
  util: {
    ...util,
    ...MathUtil,
  },
};
