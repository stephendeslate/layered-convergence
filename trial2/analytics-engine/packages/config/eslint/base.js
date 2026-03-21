/** @type {import('eslint').Linter.Config} */
module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    // Ban $queryRawUnsafe to prevent SQL injection
    'no-restricted-properties': [
      'error',
      {
        property: '$queryRawUnsafe',
        message: 'Use $queryRaw tagged template instead of $queryRawUnsafe to prevent SQL injection.',
      },
    ],
    // Warn on `as any` type assertions
    '@typescript-eslint/no-explicit-any': 'warn',
    // Ensure no unused variables
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  },
  ignorePatterns: ['dist/', 'node_modules/', '.next/'],
};
