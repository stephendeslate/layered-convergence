import tseslint from "typescript-eslint";

export default tseslint.config(
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "CallExpression[callee.property.name='$queryRawUnsafe']",
          message:
            "Use $queryRaw tagged template instead of $queryRawUnsafe to prevent SQL injection.",
        },
        {
          selector:
            "CallExpression[callee.property.name='$executeRawUnsafe']",
          message:
            "Use $executeRaw tagged template instead of $executeRawUnsafe to prevent SQL injection.",
        },
      ],
    },
  },
  {
    ignores: ["**/dist/**", "**/node_modules/**", "**/.next/**"],
  }
);
