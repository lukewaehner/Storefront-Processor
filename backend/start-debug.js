// This is a simple script to start the application with debug logging
// Run it with: node start-debug.js

// Set environment variables for debugging
process.env.DEBUG = "*";
process.env.VERBOSE = "true";

// Load the application
try {
  console.log("Starting application in debug mode...");
  require("./dist/main.js");
} catch (error) {
  console.error("Error starting application:");
  console.error(error);
}
