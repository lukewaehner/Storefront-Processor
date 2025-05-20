#!/usr/bin/env node

/**
 * This script finds all TypeScript (.ts) files in the src and test directories
 * and updates the import statements to include .js extensions, which is required
 * for ESM compatibility.
 */

import { readdir, readFile, writeFile } from "fs/promises";
import { join, extname } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const rootDir = join(__dirname, "..");

// Regular expression to match import statements referencing local files
const importRegex = /import\s+(?:{[^}]*}\s+from\s+)?['"]([^'"]*)['"]/g;

// Extensions that should be modified
const targetExtensions = [".ts"];

// Extensions to skip
const skipExtensions = [".d.ts"];

// Skip node_modules and other non-source directories
const skipDirs = ["node_modules", "dist", ".git"];

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
      if (!skipDirs.includes(file.name)) {
        await processDirectory(fullPath);
      }
      continue;
    }

    // Process only TypeScript files
    const extension = extname(file.name);
    if (
      targetExtensions.includes(extension) &&
      !skipExtensions.some((ext) => file.name.endsWith(ext))
    ) {
      await processFile(fullPath);
    }
  }
}

/**
 * Process a single file to fix import statements
 */
async function processFile(filePath) {
  let content = await readFile(filePath, "utf8");
  let modified = false;

  // Fix relative imports by adding .js extensions
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
