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
import uglify from 'rollup-plugin-uglify';
import resolve from 'rollup-plugin-node-resolve';
import * as path from 'path';

const shouldMinify = process.env.NODE_ENV === 'production';

export default [
  makeBundle('index', 'rebound'),
  makeBundle('MathUtil', 'ReboundMathUtil'),
  makeBundle('ColorUtil', 'ReboundColorUtil'),
];

function makeBundle(src, dest) {
  return {
    input: `src/${src}.js`,
    output: {
      name: dest,
      file: path.join(
        __dirname,
        'dist',
        shouldMinify ? `${dest}.min.js` : `${dest}.js`,
      ),
      format: 'umd',
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
      resolve(),
      babel({
        plugins: ['external-helpers'],
        exclude: 'node_modules/**',
      }),
      stripBanner({
        exclude: 'node_modules/**/*',
        sourceMap: true,
      }),
      shouldMinify &&
        uglify({
          compress: true,
          mangle: true,
          output: {
            comments: /Copyright/,
          },
        }),
    ],
  };
}
