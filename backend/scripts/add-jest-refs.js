// Script to add Jest references to all test files
const fs = require("fs");
const path = require("path");
const glob = require("glob");

console.log("Adding Jest references to test files...");

// Find all test files
const testFiles = glob.sync("src/**/*.spec.ts");

testFiles.forEach((file) => {
  let content = fs.readFileSync(file, "utf8");

  // Check if the file already has a reference
  if (!content.includes('<reference types="jest"')) {
    // Add the reference to the top of the file
    content = '/// <reference types="jest" />\n' + content;
    fs.writeFileSync(file, content);
    console.log(`Added Jest reference to ${file}`);
  }
});

console.log("Done!");
