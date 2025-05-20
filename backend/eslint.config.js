/* eslint-env node */
const js = require("@eslint/js");
const tseslint = require("@typescript-eslint/eslint-plugin");
const tsParser = require("@typescript-eslint/parser");
const jest = require("eslint-plugin-jest");

module.exports = [
  js.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    ignores: ["**/*.spec.ts", "**/*.test.ts", "**/test/**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
        sourceType: "module",
      },
      globals: {
        process: true,
        console: true,
        setTimeout: true,
        clearTimeout: true,
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      // Disable rules that cause issues in our codebase
      "no-undef": "off", // TypeScript already catches these errors
      "no-unused-vars": "off", // Use TypeScript's version instead
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "no-redeclare": "off",
    },
  },
  // Jest config for test files - without tsconfig project reference
  {
    files: ["**/*.spec.ts", "**/*.test.ts", "**/test/**/*.ts"],
    plugins: {
      jest,
      "@typescript-eslint": tseslint,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        sourceType: "module",
      },
      globals: {
        describe: true,
        it: true,
        test: true,
        expect: true,
        beforeAll: true,
        afterAll: true,
        beforeEach: true,
        afterEach: true,
        jest: true,
        setTimeout: true,
        process: true,
        console: true,
      },
    },
    rules: {
      ...jest.configs.recommended.rules,
      "no-undef": "off",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
    },
  },
];
