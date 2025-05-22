import { exec } from "child_process";
import * as util from "util";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

const execAsync = util.promisify(exec);
const lockFilePath = path.join(__dirname, "../.db-reset-lock");

// Load test environment variables
dotenv.config({ path: ".env.test" });

// Global setup
module.exports = async function globalSetup() {
  try {
    // Check if the database has already been set up in this test run
    if (fs.existsSync(lockFilePath)) {
      console.log("Test database already set up, skipping...");
      return;
    }

    console.log("Setting up test database...");

    // Run migrations to create test schema
    await execAsync("npx prisma migrate deploy");

    // Seed the database with test data
    await execAsync("npx ts-node prisma/seed-test.ts");

    // Create a lock file to prevent multiple setups
    fs.writeFileSync(lockFilePath, new Date().toISOString());

    console.log("Test database setup completed successfully");
  } catch (error) {
    console.error("Error setting up test database:", error);
    throw error;
  }
};

// Global teardown
module.exports.teardown = async function globalTeardown() {
  // Do not reset the database after tests
  // Only remove the lock file so next test run can set up the database again
  if (fs.existsSync(lockFilePath)) {
    fs.unlinkSync(lockFilePath);
  }
  console.log("Test environment teardown completed");
};
