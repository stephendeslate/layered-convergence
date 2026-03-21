import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tseslint.parser,
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-restricted-properties': [
        'error',
        {
          object: 'prisma',
          property: '$queryRawUnsafe',
          message: '$queryRawUnsafe is banned. Use $queryRaw with tagged template literals instead.',
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: 'CallExpression[callee.property.name="$queryRawUnsafe"]',
          message: '$queryRawUnsafe is banned. Use $queryRaw with tagged template literals instead.',
        },
      ],
      'no-eval': 'error',
    },
  },
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/.next/**'],
  },
);
