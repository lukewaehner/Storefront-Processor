import { execSync } from "child_process";
import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
import * as path from "path";
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
    });
  }
  return prismaTestClient;
};

/**
 * Resets the test database to a clean state by running the
 * prisma:migrate:test:setup npm script.
 */
export const resetTestDatabase = async () => {
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
    console.log("Test database reset successfully.");
  } catch (error) {
    console.error("Failed to reset test database:", error);
    throw error; // Rethrow to fail tests if DB reset fails
  }
};

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
};
