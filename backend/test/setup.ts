import { exec } from "child_process";
import * as util from "util";
import * as dotenv from "dotenv";

const execAsync = util.promisify(exec);

// Load test environment variables
dotenv.config({ path: ".env.test" });

// Global setup
module.exports = async function globalSetup() {
  try {
    console.log("Setting up test database...");

    // Run migrations to create test schema
    await execAsync("npx prisma migrate deploy");

    // Seed the database with test data
    await execAsync("npx ts-node prisma/seed-test.ts");

    console.log("Test database setup completed successfully");
  } catch (error) {
    console.error("Error setting up test database:", error);
    throw error;
  }
};

// Global teardown
module.exports.teardown = async function globalTeardown() {
  // Cleanup actions after all tests if needed
  console.log("Test environment teardown completed");
};
