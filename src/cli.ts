import { FileFinder } from './index.js';
import type { SearchOptions } from './index.js';
import { fileURLToPath } from 'node:url';
import { realpathSync } from 'node:fs';

function printHelp() {
  console.log(`
File Finder CLI - Minimalist filesystem discovery tool

Usage:
  file-finder <root-directory> [options]

Options:
  -p, --pattern <glob>   Filter by glob pattern (e.g., "*.ts")
  -r, --regex <regex>     Filter by regular expression
  -i, --ignore <pattern>  Ignore pattern (can be used multiple times)
  --gitignore             Use .gitignore rules if present
  --min-size <bytes>      Minimum file size in bytes
  --max-size <bytes>      Maximum file size in bytes
  --files                 Only show files
  --dirs                  Only show directories
  -h, --help              Show this help message

Example:
  file-finder ./src -p "*.ts" --gitignore
  `);
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('-h') || args.includes('--help') || args.length === 0) {
    printHelp();
    return;
  }

  const roots: string[] = [];
  let i = 0;
  while (i < args.length && !args[i].startsWith('-')) {
    roots.push(args[i]);
    i++;
  }

  if (roots.length === 0) {
    console.error('\x1b[31mError:\x1b[0m No root directory specified.');
    printHelp();
    return;
  }

  const options: SearchOptions = {
    roots,
    ignore: [],
    useGitignore: false
  };

  for (; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '-p':
      case '--pattern':
        options.pattern = args[++i];
        break;
      case '-r':
      case '--regex':
        options.regex = new RegExp(args[++i]);
        break;
      case '-i':
      case '--ignore':
        options.ignore!.push(args[++i]);
        break;
      case '--gitignore':
        options.useGitignore = true;
        break;
      case '--min-size':
        options.minSize = parseInt(args[++i], 10);
        break;
      case '--max-size':
        options.maxSize = parseInt(args[++i], 10);
        break;
      case '--files':
        options.onlyFiles = true;
        break;
      case '--dirs':
        options.onlyDirectories = true;
        break;
    }
  }

  const finder = new FileFinder();
  
  const rootsDisplay = Array.isArray(options.roots) ? options.roots.join(', ') : options.roots;
  console.log(`\x1b[36mSearching in:\x1b[0m ${rootsDisplay}`);
  if (options.pattern) console.log(`\x1b[36mPattern:\x1b[0m ${options.pattern}`);
  if (options.regex) console.log(`\x1b[36mRegex:\x1b[0m ${options.regex}`);
  console.log('');

  try {
    const startTime = Date.now();
    const results = await finder.search(options);
    const duration = Date.now() - startTime;

    if (results.length === 0) {
      console.log('\x1b[33mNo results found.\x1b[0m');
    } else {
      results.forEach(res => {
        const type = res.isDirectory ? '\x1b[34m[DIR]\x1b[0m' : '\x1b[32m[FILE]\x1b[0m';
        const size = res.isDirectory ? '' : ` (${res.size} bytes)`;
        console.log(`${type} ${res.path}${size}`);
      });
      
      console.log(`\n\x1b[32mFound ${results.length} items in ${duration}ms\x1b[0m`);
    }
  } catch (error: any) {
    console.error(`\x1b[31mError:\x1b[0m ${error.message}`);
  }
}

const isMain = realpathSync(fileURLToPath(import.meta.url)) === realpathSync(process.argv[1]);

if (isMain) {
  main().catch(console.error);
}
