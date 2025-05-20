/* eslint-env node */
// backend/jest-unit.config.js
module.exports = {
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: "src", // Look for source files in src
  testRegex: ".*\\.spec\\.ts$", // Match .spec.ts files
  transform: {
    "^.+\\.(t|j)s$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.test.json",
      },
    ],
  },
  collectCoverageFrom: ["**/*.(t|j)s"],
  coverageDirectory: "../coverage",
  testEnvironment: "node",
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  injectGlobals: true,
  testTimeout: 30000,
  setupFilesAfterEnv: ["<rootDir>/../test/jest-setup.js"],
  // Retry failed tests to handle flaky tests in CI environment
  retry: 2,
  // Verbose output when tests fail
  verbose: true,
  // Add reporters for better CI output
  reporters: [
    "default",
    [
      "jest-junit",
      {
        outputDirectory: "./test-reports",
        outputName: "junit.xml",
      },
    ],
  ],
  // Store test output for debugging
  testResultsProcessor: "jest-junit",
};
