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

import _onFrame from './onFrame';

const concat = Array.prototype.concat;
const slice = Array.prototype.slice;

// Bind a function to a context object.
export function bind(func: Function, context: Object) {
  var args = slice.call(arguments, 2);
  return function() {
    func.apply(context, concat.call(args, slice.call(arguments)));
  };
};

// Add all the properties in the source to the target.
export function extend(target: Object, source: Object) {
  for (var key in source) {
    if (source.hasOwnProperty(key)) {
      target[key] = source[key];
    }
  }
};

// Cross browser/node timer functions.
export function onFrame(func: Function) {
  return _onFrame(func);
};

// Lop off the first occurence of the reference in the Array.
export function removeFirst(array: Array<any>, item: any): void {
  var idx = array.indexOf(item);
  idx != -1 && array.splice(idx, 1);
}

type Color = {
  r: number,
  g: number,
  b: number,
};

// Here are a couple of function to convert colors between hex codes and RGB
// component values. These are handy when performing color
// tweening animations.
var colorCache = {};
export function hexToRGB(color: string): Color {
  if (colorCache[color]) {
    return colorCache[color];
  }
  color = color.replace('#', '');
  if (color.length === 3) {
    color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
  }
  var parts = color.match(/.{2}/g);
  if (!parts || parts.length < 3) {
    throw new Error('Expected a color string of format #rrggbb');
  }

  var ret: Color = {
    r: parseInt(parts[0], 16),
    g: parseInt(parts[1], 16),
    b: parseInt(parts[2], 16)
  };

  colorCache[color] = ret;
  return ret;
};

export function rgbToHex(rNum: number, gNum: number, bNum: number): string {
  let r = rNum.toString(16);
  let g = gNum.toString(16);
  let b = bNum.toString(16);
  r = r.length < 2 ? '0' + r : r;
  g = g.length < 2 ? '0' + g : g;
  b = b.length < 2 ? '0' + b : b;
  return '#' + r + g + b;
};
