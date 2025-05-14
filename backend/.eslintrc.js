// This file is used for compatibility with tools that don't yet support eslint.config.js
export default {
  root: true,
  env: {
    node: true,
    jest: true,
    es2022: true,
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
  },
  globals: {
    process: true,
    console: true,
    setTimeout: true,
    __dirname: true,
  },
};
