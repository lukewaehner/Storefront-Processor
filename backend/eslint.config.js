import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import jest from "eslint-plugin-jest";

export default [
  js.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
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
  // Jest config for test files
  {
    files: ["**/*.spec.ts", "**/*.test.ts", "**/test/**/*.ts"],
    plugins: {
      jest,
    },
    languageOptions: {
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
    },
  },
];
