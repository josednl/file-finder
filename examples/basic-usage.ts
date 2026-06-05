/**
 * Basic Usage Example
 * 
 * This script demonstrates the most fundamental use of FileFinder:
 * searching for files with a specific glob pattern starting from a root directory.
 * 
 * Concepts:
 * 1. Recursive Traversal: The finder explores all subdirectories automatically.
 * 2. Glob Matching: Using simple patterns like "*.ts" to filter results.
 */

import { FileFinder } from '../src/index.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

async function main() {
  const finder = new FileFinder();

  console.log('--- Basic Search Example ---');
  console.log(`Searching for TypeScript files in: ${projectRoot}\n`);

  try {
    const results = await finder.search({
      roots: projectRoot,
      pattern: '*.ts',
      ignore: ['node_modules'] // Ignore node_modules for speed
    });

    console.log(`Found ${results.length} files:`);
    results.forEach(file => {
      const relativePath = file.path.replace(projectRoot, '.');
      console.log(`- ${relativePath} (${file.size} bytes)`);
    });
  } catch (error) {
    console.error('Search failed:', error);
  }
}

main();
