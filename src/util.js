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

/* eslint-disable flowtype/no-weak-types */

import _onFrame from './onFrame';

const concat = Array.prototype.concat;
const slice = Array.prototype.slice;

// Bind a function to a context object.
export function bind(
  func: Function,
  context: Object,
  ...outerArgs: Array<any>
) {
  return function(...innerArgs: Array<any>) {
    func.apply(context, concat.call(outerArgs, slice.call(innerArgs)));
  };
}

// Add all the properties in the source to the target.
export function extend(target: Object, source: Object) {
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      target[key] = source[key];
    }
  }
}

// Cross browser/node timer functions.
export function onFrame(func: Function) {
  return _onFrame(func);
}

// Lop off the first occurence of the reference in the Array.
export function removeFirst<T>(array: Array<T>, item: T): void {
  const idx = array.indexOf(item);
  idx !== -1 && array.splice(idx, 1);
}

type Color = {
  r: number,
  g: number,
  b: number,
};

const colorCache = {};
/**
 * Converts a hex-formatted color string to its rgb-formatted equivalent. Handy
 * when performing color tweening animations
 * @public
 * @param colorString A hex-formatted color string
 * @return An rgb-formatted color string
 */
export function hexToRGB(colorString: string): Color {
  if (colorCache[colorString]) {
    return colorCache[colorString];
  }
  let normalizedColor = colorString.replace('#', '');
  if (normalizedColor.length === 3) {
    normalizedColor =
      normalizedColor[0] +
      normalizedColor[0] +
      normalizedColor[1] +
      normalizedColor[1] +
      normalizedColor[2] +
      normalizedColor[2];
  }
  const parts = normalizedColor.match(/.{2}/g);
  if (!parts || parts.length < 3) {
    throw new Error('Expected a color string of format #rrggbb');
  }

  const ret: Color = {
    r: parseInt(parts[0], 16),
    g: parseInt(parts[1], 16),
    b: parseInt(parts[2], 16),
  };

  colorCache[colorString] = ret;
  return ret;
}

/**
 * Converts a rgb-formatted color string to its hex-formatted equivalent. Handy
 * when performing color tweening animations
 * @public
 * @param colorString An rgb-formatted color string
 * @return A hex-formatted color string
 */
export function rgbToHex(rNum: number, gNum: number, bNum: number): string {
  let r = rNum.toString(16);
  let g = gNum.toString(16);
  let b = bNum.toString(16);
  r = r.length < 2 ? '0' + r : r;
  g = g.length < 2 ? '0' + g : g;
  b = b.length < 2 ? '0' + b : b;
  return '#' + r + g + b;
}
