/* eslint-env node */
// This file is run before each test file
// It can be used to set up global test environment variables
const {
  resetTestDatabase,
  disconnectPrismaTestClient,
  verifyTestDatabaseConnection,
} = require("./utils/db-test-utils");

// Setup global mocks or environment values here if needed
process.env.NODE_ENV = "test";

// Retry logic for test database setup
async function setupTestDatabase(retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Reset and migrate the test database before all tests
      await resetTestDatabase();

      // Verify database connection
      const isConnected = await verifyTestDatabaseConnection();
      if (!isConnected) {
        throw new Error("Database connection verification failed");
      }

      console.log("Test database setup successful");
      return;
    } catch (error) {
      console.error(
        `Database setup attempt ${attempt}/${retries} failed:`,
        error
      );
      if (attempt === retries) {
        throw new Error(
          `Failed to setup test database after ${retries} attempts: ${error.message}`
        );
      }
      // Wait a bit before retrying
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }
}

// Reset and migrate the test database before all tests
beforeAll(async () => {
  await setupTestDatabase();
});

// Disconnect the Prisma client after all tests
afterAll(async () => {
  await disconnectPrismaTestClient();
});

// Increase timeout for all tests since DB operations can be slow
jest.setTimeout(30000);

// Comment out log silencing when debugging test issues
if (process.env.DEBUG_TESTS !== "true") {
  // Silence console logs during tests
  global.console = {
    ...console,
    log: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  };

  // Keep error and warnings for test debugging
  global.console.error = console.error;
  global.console.warn = console.warn;
}
