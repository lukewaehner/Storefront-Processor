/**
 * Utility functions for dealing with file paths in ESM modules.
 * This provides __dirname and __filename equivalents that work in ESM mode.
 */
import { fileURLToPath } from "url";
import * as path from "path";

/**
 * Get the directory name of a file in ESM context (equivalent to __dirname in CommonJS)
 *
 * @param importMetaUrl The import.meta.url of the calling module
 * @returns The directory name
 */
export function getDirname(importMetaUrl: string): string {
  const filename = fileURLToPath(importMetaUrl);
  return path.dirname(filename);
}

/**
 * Get the file name of a file in ESM context (equivalent to __filename in CommonJS)
 *
 * @param importMetaUrl The import.meta.url of the calling module
 * @returns The file name
 */
export function getFilename(importMetaUrl: string): string {
  return fileURLToPath(importMetaUrl);
}
