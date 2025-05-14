// backend/jest-unit.config.js
export default {
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: "src", // Look for source files in src
  testRegex: ".*\\.spec\\.ts$", // Match .spec.ts files
  transform: {
    "^.+\\.(t|j)s$": [
      "ts-jest",
      {
        useESM: true,
        isolatedModules: true,
      },
    ],
  },
  collectCoverageFrom: [
    "**/*.(t|j)s",
    "!**/node_modules/**",
    "!**/main.ts", // Don't collect coverage from main.ts
    "!**/*.module.ts", // Don't collect coverage from module files by default
    "!**/*.dto.ts", // Don't collect coverage from DTOs by default
    "!**/*.entity.ts", // Don't collect coverage from entities by default
    "!**/prisma/generated/**",
  ],
  coverageDirectory: "../coverage-unit", // Separate coverage for unit tests
  testEnvironment: "node",
  clearMocks: true,
  setupFilesAfterEnv: ["../test/setup-jest.ts"],
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  forceExit: true,
  detectOpenHandles: true,
};
