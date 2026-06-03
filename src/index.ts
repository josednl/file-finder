export class FileFinder {
  async search(_options: { root: string; pattern: string }) {
    return [];
  }
}

async function main() {
  console.log('File Finder CLI');
}

// Check if this file is the main module
import { fileURLToPath } from 'node:url';
import { realpathSync } from 'node:fs';

const isMain = realpathSync(fileURLToPath(import.meta.url)) === realpathSync(process.argv[1]);

if (isMain) {
  main().catch(console.error);
}
