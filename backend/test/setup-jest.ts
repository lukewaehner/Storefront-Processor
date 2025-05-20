// Import jest from @jest/globals for ESM compatibility
import { jest } from "@jest/globals";
import {
  resetTestDatabase,
  disconnectPrismaTestClient,
} from "./utils/db-test-utils.js";
import {
  resetMockDatabase,
  disconnectMockPrismaClient,
} from "./utils/mock-db-utils.js";

// Global variable to track if we're using mocks
let usingMocks = false;

// Global beforeAll hook - runs once before all tests
beforeAll(async () => {
  console.log("🧪 Setting up test environment...");
  // Set NODE_ENV to test just to be safe
  process.env.NODE_ENV = "test";

  try {
    // Try to reset the test database first
    resetTestDatabase();
    console.log("✅ Test environment setup complete with real database.");
  } catch (error) {
    // If database setup fails, use mocks instead
    console.log("⚠️ Database connection failed, using mocks instead.");
    usingMocks = true;
    resetMockDatabase();
    console.log("✅ Test environment setup complete with mocks.");
  }
});

// Global afterAll hook - runs once after all tests
afterAll(async () => {
  console.log("🧹 Cleaning up test environment...");

  // Disconnect the appropriate client based on whether we're using mocks
  if (usingMocks) {
    await disconnectMockPrismaClient();
  } else {
    await disconnectPrismaTestClient();
  }

  console.log("✅ Test environment cleanup complete.");
});

// Expose the flag for tests to check
export const isUsingMocks = () => usingMocks;

// Set Jest timeout to a higher value if needed for database operations
// In ESM mode, we need to use the global object
jest.setTimeout(30000); // 30 seconds

// Make jest available globally
globalThis.jest = jest;

// Optional: Global beforeEach hook - runs before each test
// beforeEach(() => {
//   // You could perform additional setup before each test if needed
//   // e.g., mocking services, resetting spies, etc.
// });

// Optional: Global afterEach hook - runs after each test
// afterEach(() => {
//   // You could perform cleanup after each test if needed
//   // e.g., clearing mocks, resetting any global state changes, etc.
// });
