import babel from 'rollup-plugin-babel';
import stripBanner from 'rollup-plugin-strip-banner';

export default {
  input: 'src/index.js',
  output: {
    name: 'rebound',
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
