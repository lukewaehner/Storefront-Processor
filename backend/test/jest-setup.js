/* eslint-env node */
// This file is run before each test file
// It can be used to set up global test environment variables

// Increase timeout for all tests since DB operations can be slow
jest.setTimeout(30000);

// Setup global mocks or environment values here if needed
process.env.NODE_ENV = "test";

// Silence console logs during tests
// Comment these out if you need to see console output for debugging
global.console = {
  ...console,
  log: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Keep error and warnings for test debugging
global.console.error = console.error;
global.console.warn = console.warn;
