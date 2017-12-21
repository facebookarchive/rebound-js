import babel from 'rollup-plugin-babel';

export default {
  entry: 'src/index.js',
  moduleName: 'rebound',
  plugins: [
    babel({
      plugins: ['external-helpers'],
      exclude: 'node_modules/**'
    })
  ]
};
