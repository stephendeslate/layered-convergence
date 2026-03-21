module.exports = {
  ...require('@analytics-engine/config/eslint/base'),
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  root: true,
};
