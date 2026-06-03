import { readdir, stat, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { IgnoreManager } from './IgnoreManager.js';

export interface SearchResult {
  path: string;
  name: string;
  isDirectory: boolean;
  size: number;
  modifiedAt: Date;
}

export interface SearchOptions {
  root: string;
  pattern?: string;
  regex?: RegExp;
  ignore?: string[];
  useGitignore?: boolean;
  minSize?: number;
  maxSize?: number;
  onlyDirectories?: boolean;
  onlyFiles?: boolean;
}

export class FileFinder {
  async search(options: SearchOptions): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    const ignoreManager = new IgnoreManager(options.ignore || []);

    if (options.useGitignore) {
      try {
        const gitignorePath = join(options.root, '.gitignore');
        const content = await readFile(gitignorePath, 'utf-8');
        ignoreManager.addPatterns(content.split('\n'));
      } catch (e) {
        // .gitignore not found or unreadable, ignore silently
      }
    }

    await this.traverse(options.root, results, ignoreManager, options);

    let filtered = results;

    if (options.regex) {
      filtered = filtered.filter(result => options.regex!.test(result.name));
    } else if (options.pattern && options.pattern !== '*') {
      const regex = this.globToRegex(options.pattern);
      filtered = filtered.filter(result => regex.test(result.name));
    }

    if (options.minSize !== undefined) {
      filtered = filtered.filter(result => result.size >= options.minSize!);
    }

    if (options.maxSize !== undefined) {
      filtered = filtered.filter(result => result.size <= options.maxSize!);
    }

    if (options.onlyDirectories) {
      filtered = filtered.filter(result => result.isDirectory);
    }

    if (options.onlyFiles) {
      filtered = filtered.filter(result => !result.isDirectory);
    }

    return filtered;
  }

  private globToRegex(glob: string): RegExp {
    const escaped = glob.replace(/[.+^${}()|[\]\\]/g, '\\$&');
    const pattern = escaped
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');
    return new RegExp(`^${pattern}$`);
  }

  private async traverse(
    currentDir: string,
    results: SearchResult[],
    ignoreManager: IgnoreManager,
    options: SearchOptions
  ): Promise<void> {
    const entries = await readdir(currentDir);

    for (const entry of entries) {
      if (ignoreManager.shouldIgnore(entry)) {
        continue;
      }

      const fullPath = join(currentDir, entry);
      let entryStat;
      
      try {
        entryStat = await stat(fullPath);
      } catch (e) {
        continue;
      }

      const isDirectory = entryStat.isDirectory();
      
      const result: SearchResult = {
        path: fullPath,
        name: entry,
        isDirectory,
        size: entryStat.size,
        modifiedAt: entryStat.mtime
      };

      results.push(result);

      if (isDirectory) {
        await this.traverse(fullPath, results, ignoreManager, options);
      }
    }
  }
}

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

  const options: SearchOptions = {
    root: args[0],
    ignore: [],
    useGitignore: false
  };

  for (let i = 1; i < args.length; i++) {
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
  
  console.log(`\x1b[36mSearching in:\x1b[0m ${options.root}`);
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

import { fileURLToPath } from 'node:url';
import { realpathSync } from 'node:fs';

const isMain = realpathSync(fileURLToPath(import.meta.url)) === realpathSync(process.argv[1]);

if (isMain) {
  main().catch(console.error);
}
