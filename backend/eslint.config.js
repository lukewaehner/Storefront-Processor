import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import jest from "eslint-plugin-jest";

export default [
  js.configs.recommended,
  {
    ignores: ["dist", "node_modules", "coverage"],
  },
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsParser,
      sourceType: "module",
      ecmaVersion: 2022,
      globals: {
        // Node.js globals
        process: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        __dirname: "readonly",

        // Jest globals
        describe: "readonly",
        expect: "readonly",
        it: "readonly",
        jest: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
      },
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    rules: {
      // TypeScript specific rules
      "@typescript-eslint/explicit-function-return-type": "warn",
      "@typescript-eslint/explicit-module-boundary-types": "warn",
      "@typescript-eslint/no-explicit-any": "warn",

      // General rules
      "no-unused-vars": "off", // TypeScript handles this better
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "no-undef": "error",
      "no-console": "off", // Allow console in development
    },
  },
  {
    // Special config for test files
    files: ["**/*.spec.ts", "**/test/**/*.ts"],
    plugins: {
      jest: jest,
    },
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off", // More relaxed for tests
    },
  },
];
