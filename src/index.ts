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
  roots: string | string[];
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
    const roots = Array.isArray(options.roots) ? options.roots : [options.roots];

    for (const root of roots) {
      const ignoreManager = new IgnoreManager(options.ignore || []);

      if (options.useGitignore) {
        try {
          const gitignorePath = join(root, '.gitignore');
          const content = await readFile(gitignorePath, 'utf-8');
          ignoreManager.addPatterns(content.split('\n'));
        } catch (e) {
          // .gitignore not found or unreadable, ignore silently
        }
      }

      await this.traverse(root, results, ignoreManager, options);
    }

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
