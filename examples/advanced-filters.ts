/**
 * Advanced Filters Example
 * 
 * FileFinder allows filtering results by size, type, and custom regex.
 * This demonstrates how to combine these filters for precise discovery.
 */

import { FileFinder } from '../src/index.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

async function main() {
  const finder = new FileFinder();

  console.log('--- Advanced Filters Example ---');
  console.log('Searching for files larger than 1KB that are NOT in node_modules or .git\n');

  try {
    const results = await finder.search({
      roots: projectRoot,
      minSize: 1024, // 1KB
      ignore: ['node_modules', '.git'],
      onlyFiles: true
    });

    console.log(`Found ${results.length} large files:`);
    results.sort((a, b) => b.size - a.size).forEach(file => {
      const relativePath = file.path.replace(projectRoot, '.');
      console.log(`- ${relativePath} [${(file.size / 1024).toFixed(2)} KB]`);
    });

  } catch (error) {
    console.error('Search failed:', error);
  }
}

main();
