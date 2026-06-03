import { readdir, stat, readFile } from 'node:fs/promises';
import { join, basename } from 'node:path';
import { IgnoreManager } from './IgnoreManager.js';

export interface SearchResult {
  path: string;
  name: string;
  isDirectory: boolean;
}

export interface SearchOptions {
  root: string;
  pattern?: string;
  ignore?: string[];
  useGitignore?: boolean;
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

    await this.traverse(options.root, results, ignoreManager);

    if (options.pattern && options.pattern !== '*') {
      const regex = this.globToRegex(options.pattern);
      return results.filter(result => regex.test(result.name));
    }

    return results;
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
    ignoreManager: IgnoreManager
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

      if (entryStat.isDirectory()) {
        await this.traverse(fullPath, results, ignoreManager);
      } else {
        results.push({
          path: fullPath,
          name: entry,
          isDirectory: false
        });
      }
    }
  }
}

async function main() {
  const finder = new FileFinder();
  const root = './';
  const pattern = '*.ts';
  
  console.log(`Searching for "${pattern}" in "${root}" (ignoring node_modules, .git, dist)...\n`);
  
  try {
    const results = await finder.search({ 
      root, 
      pattern,
      ignore: ['node_modules', '.git', 'dist']
    });
    
    if (results.length === 0) {
      console.log('No files found.');
    } else {
      console.log(`Found ${results.length} files:`);
      results.forEach(file => {
        console.log(` - ${file.path}`);
      });
    }
  } catch (error) {
    console.error('Error during search:', error);
  }
}

import { fileURLToPath } from 'node:url';
import { realpathSync } from 'node:fs';

const isMain = realpathSync(fileURLToPath(import.meta.url)) === realpathSync(process.argv[1]);

if (isMain) {
  main().catch(console.error);
}
