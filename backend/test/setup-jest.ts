import {
  resetTestDatabase,
  disconnectPrismaTestClient,
} from "./utils/db-test-utils";

// Global beforeAll hook - runs once before all tests
beforeAll(async () => {
  console.log("🧪 Setting up test environment...");
  // Set NODE_ENV to test just to be safe
  process.env.NODE_ENV = "test";

  // Reset the test database to a clean state with all migrations applied
  resetTestDatabase();

  console.log("✅ Test environment setup complete.");
});

// Global afterAll hook - runs once after all tests
afterAll(async () => {
  console.log("🧹 Cleaning up test environment...");

  // Disconnect the Prisma client if it was used
  await disconnectPrismaTestClient();

  console.log("✅ Test environment cleanup complete.");
});

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

// Set Jest timeout to a higher value if needed for database operations
jest.setTimeout(30000); // 30 seconds
