import { execSync } from "child_process";
import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";
// Using regular CommonJS __dirname since we switched to CommonJS
// import { getDirname } from "../../src/utils/esm-paths";

// Get the current directory using CommonJS __dirname
// const __dirname = getDirname(import.meta.url);

// Load .env.test variables
dotenv.config({ path: path.resolve(__dirname, "../../.env.test") });

// Ensure DATABASE_URL is loaded for the test environment
if (process.env.NODE_ENV !== "test") {
  throw new Error("NODE_ENV must be set to test when using db-test-utils.");
}
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL for the test environment is not set. Make sure .env.test is correctly configured and loaded."
  );
}

// For tracking when the DB was last reset
const DB_RESET_LOCK_FILE = path.resolve(__dirname, "../../.db-reset-lock");

// Singleton PrismaClient for test utilities if needed for seeding later
let prismaTestClient: PrismaClient | null = null;

export const getPrismaTestClient = (): PrismaClient => {
  if (!prismaTestClient) {
    prismaTestClient = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL, // Uses the test database URL
        },
      },
      log: process.env.DEBUG_PRISMA ? ["query", "error", "warn"] : ["error"],
    });
  }
  return prismaTestClient;
};

/**
 * Resets the test database to a clean state by running the
 * prisma:migrate:test:setup npm script.
 */
export const resetTestDatabase = async () => {
  // Check if we've already reset the database in this test run
  // This helps prevent multiple DB resets when running many test files
  if (isTestDatabaseResetRecently()) {
    console.log("Using existing test database (already reset recently)");
    return;
  }

  console.log("Resetting test database...");
  try {
    // Ensure NODE_ENV is test for the child process as well
    // The command should be run from the root of the 'backend' directory
    const backendRoot = path.resolve(__dirname, "../..");
    execSync("npm run prisma:migrate:test:setup", {
      stdio: "inherit", // Pipe output to console
      env: { ...process.env, NODE_ENV: "test" },
      cwd: backendRoot, // Set current working directory to backend folder
    });

    // Create a lock file to indicate the DB was reset
    createDbResetLock();

    console.log("Test database reset successfully.");
  } catch (error) {
    console.error("Failed to reset test database:", error);
    throw error; // Rethrow to fail tests if DB reset fails
  }
};

/**
 * Check if the database was reset recently (within the last 60 seconds)
 */
function isTestDatabaseResetRecently(): boolean {
  if (!fs.existsSync(DB_RESET_LOCK_FILE)) {
    return false;
  }

  try {
    const lockFileContent = fs.readFileSync(DB_RESET_LOCK_FILE, "utf-8");
    const resetTime = parseInt(lockFileContent, 10);
    const now = Date.now();

    // If reset happened less than 60 seconds ago, consider it recent
    return now - resetTime < 60 * 1000;
  } catch (error) {
    // If we can't read the file or parse the date, assume no recent reset
    return false;
  }
}

/**
 * Create a lock file with the current timestamp
 */
function createDbResetLock(): void {
  fs.writeFileSync(DB_RESET_LOCK_FILE, Date.now().toString(), "utf-8");
}

/**
 * Disconnects the prismaTestClient if it was initialized.
 * Call this in a global afterAll hook in your Jest setup.
 */
export const disconnectPrismaTestClient = async () => {
  if (prismaTestClient) {
    await prismaTestClient.$disconnect();
    prismaTestClient = null;
  }
};

/**
 * Verify database connection and schema existence
 */
export const verifyTestDatabaseConnection = async (): Promise<boolean> => {
  const client = getPrismaTestClient();
  try {
    // Try a simple query to verify connection
    await client.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error("Database connection verification failed:", error);
    return false;
  }
};

// Example of how you might seed specific data (can be expanded)
// export const seedTestData = async () => {
//   const client = getPrismaTestClient();
//   // Example: Create a default tenant for tests
//   await client.tenant.create({
//     data: {
//       id: 'test-tenant-1',
//       name: 'Test Tenant 1',
//       slug: 'test-tenant-1',
//       // ... other required fields
//     },
//   });
//   console.log('Test data seeded.');
// };

// Export for CommonJS
module.exports = {
  getPrismaTestClient,
  resetTestDatabase,
  disconnectPrismaTestClient,
  verifyTestDatabaseConnection,
};
