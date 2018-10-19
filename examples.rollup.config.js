/**
 *  Copyright (c) 2013, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

import babel from 'rollup-plugin-babel';
import stripBanner from 'rollup-plugin-strip-banner';
import * as path from 'path';

export default [
  makeExample('cascadeEffect'),
  makeExample('hamburgerButton'),
  makeExample('photoScale'),
];

function makeExample(name) {
  return {
    experimentalCodeSplitting: true,
    input: path.join(__dirname, 'examples', 'src', name, 'main.js'),
    external: ['rebound'],
    output: {
      file: path.join(__dirname, 'examples', 'dist', name + '.js'),
      format: 'iife',
      globals: {
        rebound: 'rebound',
      },
      banner: `
  /**
   *  Copyright (c) 2013, Facebook, Inc.
   *  All rights reserved.
   *
   *  This source code is licensed under the BSD-style license found in the
   *  LICENSE file in the root directory of this source tree. An additional grant
   *  of patent rights can be found in the PATENTS file in the same directory.
   */
        `.trim(),
    },
    plugins: [
      babel({
        plugins: ['external-helpers'],
        exclude: 'node_modules/**',
      }),
      stripBanner({
        exclude: 'node_modules/**/*',
        sourceMap: true,
      }),
    ],
  };
}
