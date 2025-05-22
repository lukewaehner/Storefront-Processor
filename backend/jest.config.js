/** @type {import('jest').Config} */
module.exports = {
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: "src",
  testRegex: ".*\\.spec\\.ts$",
  transform: {
    "^.+\\.(t|j)s$": "ts-jest",
  },
  collectCoverageFrom: ["**/*.(t|j)s"],
  coverageDirectory: "../coverage",
  testEnvironment: "node",
  globalSetup: "<rootDir>/../test/setup.ts",
  globalTeardown: "<rootDir>/../test/setup.ts",
  setupFilesAfterEnv: ["<rootDir>/../test/jest.setup.ts"],
};
