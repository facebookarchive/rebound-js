module.exports = {
  extends: 'fbjs-opensource',
  plugins: ['prettier'],
  rules: {
    'consistent-return': 0, // handled by flow
    'max-len': 0, // handled by prettier
    'prettier/prettier': ['error'],
  },
};
