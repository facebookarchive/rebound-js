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

// This helper function does a linear interpolation of a value from
// one range to another. This can be very useful for converting the
// motion of a Spring to a range of UI property values. For example a
// spring moving from position 0 to 1 could be interpolated to move a
// view from pixel 300 to 350 and scale it from 0.5 to 1. The current
// position of the `Spring` just needs to be run through this method
// taking its input range in the _from_ parameters with the property
// animation range in the _to_ parameters.
export function mapValueInRange(
  value: number,
  fromLow: number,
  fromHigh: number,
  toLow: number,
  toHigh: number,
): number {
  var fromRangeSize = fromHigh - fromLow;
  var toRangeSize = toHigh - toLow;
  var valueScale = (value - fromLow) / fromRangeSize;
  return toLow + valueScale * toRangeSize;
}

// Interpolate two hex colors in a 0 - 1 range or optionally provide a
// custom range with fromLow,fromHight. The output will be in hex by default
// unless asRGB is true in which case it will be returned as an rgb string.
export function interpolateColor(
  val: number,
  startColorStr: string,
  endColorStr: string,
  fromLow: number,
  fromHigh: number,
  asRGB: string,
): string {
  fromLow = fromLow === undefined ? 0 : fromLow;
  fromHigh = fromHigh === undefined ? 1 : fromHigh;
  const startColor = util.hexToRGB(startColorStr);
  const endColor = util.hexToRGB(endColorStr);
  var r = Math.floor(
    mapValueInRange(val, fromLow, fromHigh, startColor.r, endColor.r),
  );
  var g = Math.floor(
    mapValueInRange(val, fromLow, fromHigh, startColor.g, endColor.g),
  );
  var b = Math.floor(
    mapValueInRange(val, fromLow, fromHigh, startColor.b, endColor.b),
  );
  if (asRGB) {
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  } else {
    return util.rgbToHex(r, g, b);
  }
}

export function degreesToRadians(deg: number): number {
  return deg * Math.PI / 180;
}

export function radiansToDegrees(rad: number): number {
  return rad * 180 / Math.PI;
}
