#!/bin/bash

# Script to remove .js extensions and fix test files for CommonJS
# This helps when converting from ESM to CommonJS

echo "Fixing imports in test files..."

# Use find and sed to replace .js" with " in all .ts files in src directory
find src -name "*.spec.ts" -type f -exec sed -i '' 's/\.js"/"/g' {} \;

# Add Jest reference directive to all spec files if it doesn't exist
find src -name "*.spec.ts" -type f -exec grep -l -v "<reference types=\"jest\"" {} \; | xargs -I{} sed -i '' '1i\\
/// <reference types="jest" />\
' {}

echo "Done!" 