#!/usr/bin/env node

/**
 * This script finds all test files (*.spec.ts) and adds the proper Jest imports
 * for ESM compatibility.
 */

import { readdir, readFile, writeFile } from "fs/promises";
import { join, extname } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const rootDir = join(__dirname, "..");

// Counter for modified files
let modifiedFiles = 0;

/**
 * Recursively process all files in a directory
 */
async function processDirectory(directory) {
  const files = await readdir(directory, { withFileTypes: true });

  for (const file of files) {
    const fullPath = join(directory, file.name);

    if (file.isDirectory()) {
      if (!["node_modules", "dist", ".git"].includes(file.name)) {
        await processDirectory(fullPath);
      }
      continue;
    }

    // Process only test files
    if (file.name.endsWith(".spec.ts")) {
      await processFile(fullPath);
    }
  }
}

/**
 * Process a single file to add Jest imports
 */
async function processFile(filePath) {
  let content = await readFile(filePath, "utf8");
  let modified = false;

  // Check if the file already has Jest imports
  if (!content.includes("import { jest") && !content.includes("import {jest")) {
    // Add the Jest imports at the top of the file
    const jestImport =
      "import { jest, describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';\n";
    content = jestImport + content;
    modified = true;
  }

  // Fix relative imports by adding .js extensions
  const importRegex = /import\s+(?:{[^}]*}\s+from\s+)?['"]([^'"]*)['"]/g;
  const newContent = content.replace(importRegex, (match, importPath) => {
    // Only add .js to relative imports that don't already have an extension
    if (
      (importPath.startsWith("./") ||
        importPath.startsWith("../") ||
        importPath.startsWith("/")) &&
      !importPath.includes(".js") &&
      !importPath.match(/\.\w+$/)
    ) {
      modified = true;
      return match.replace(importPath, `${importPath}.js`);
    }
    return match;
  });

  if (modified) {
    await writeFile(filePath, newContent, "utf8");
    console.log(`Updated: ${filePath}`);
    modifiedFiles++;
  }
}

async function main() {
  try {
    // Process source and test directories
    await processDirectory(join(rootDir, "src"));
    await processDirectory(join(rootDir, "test"));

    console.log(`\nProcess complete. Modified ${modifiedFiles} files.`);
  } catch (error) {
    console.error("Error processing files:", error);
    process.exit(1);
  }
}

main();
