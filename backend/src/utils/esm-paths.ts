/**
 * Utility functions for dealing with file paths in both CommonJS and ESM modules.
 */
import { fileURLToPath } from "url";
import * as path from "path";

/**
 * Get the directory name of a file in either CommonJS or ESM context
 *
 * @param importMetaUrl Optional import.meta.url for ESM context
 * @returns The directory name
 */
export function getDirname(importMetaUrl?: string): string {
  if (importMetaUrl) {
    // ESM context
    const filename = fileURLToPath(importMetaUrl);
    return path.dirname(filename);
  }
  // CommonJS context
  return __dirname;
}

/**
 * Get the file name of a file in either CommonJS or ESM context
 *
 * @param importMetaUrl Optional import.meta.url for ESM context
 * @returns The file name
 */
export function getFilename(importMetaUrl?: string): string {
  if (importMetaUrl) {
    // ESM context
    return fileURLToPath(importMetaUrl);
  }
  // CommonJS context
  return __filename;
}
