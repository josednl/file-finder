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
  signal?: AbortSignal;
}

export class FileFinder {
  async search(options: SearchOptions): Promise<SearchResult[]> {
    options.signal?.throwIfAborted();
    const results: SearchResult[] = [];
    const roots = Array.isArray(options.roots) ? options.roots : [options.roots];
    
    // Pre-compile regex for performance
    let searchRegex: RegExp | undefined = options.regex;
    if (!searchRegex && options.pattern && options.pattern !== '*') {
      searchRegex = this.globToRegex(options.pattern);
    }

    const promises = roots.map(async (root) => {
      const ignoreManager = new IgnoreManager(options.ignore || []);

      if (options.useGitignore) {
        try {
          const gitignorePath = join(root, '.gitignore');
          const content = await readFile(gitignorePath, { encoding: 'utf-8', signal: options.signal });
          ignoreManager.addPatterns(content.split('\n'));
        } catch (e: any) {
          if (e.name === 'AbortError') throw e;
          // .gitignore not found or unreadable, ignore silently
        }
      }

      await this.traverse(root, results, ignoreManager, options, searchRegex);
    });

    await Promise.all(promises);

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
    ignoreManager: IgnoreManager,
    options: SearchOptions,
    searchRegex?: RegExp
  ): Promise<void> {
    options.signal?.throwIfAborted();
    const entries = await readdir(currentDir, { withFileTypes: true, signal: options.signal } as any);

    const tasks = entries.map(async (entry: any) => {
      options.signal?.throwIfAborted();
      if (ignoreManager.shouldIgnore(entry.name)) {
        return;
      }

      const fullPath = join(currentDir, entry.name);
      const isDirectory = entry.isDirectory();

      // We only need stat if we are filtering by size or if we need the modified date for the result
      // According to SearchResult interface, we always need size and modifiedAt.
      // However, we can skip stat if we are only looking for directories and entry is a file.
      if (options.onlyDirectories && !isDirectory) return;
      if (options.onlyFiles && isDirectory) {
        // We still need to traverse subdirectories even if we only want files
        await this.traverse(fullPath, results, ignoreManager, options, searchRegex);
        return;
      }

      let entryStat;
      try {
        entryStat = await stat(fullPath, { signal: options.signal } as any);
      } catch (e: any) {
        if (e.name === 'AbortError') throw e;
        return;
      }

      // Apply size filters early
      if (options.minSize !== undefined && entryStat.size < options.minSize) return;
      if (options.maxSize !== undefined && entryStat.size > options.maxSize) return;

      // Apply pattern/regex filters early
      if (searchRegex && !searchRegex.test(entry.name)) {
        // If it's a directory, we still need to recurse even if it doesn't match the pattern
        if (isDirectory) {
          await this.traverse(fullPath, results, ignoreManager, options, searchRegex);
        }
        return;
      }

      const result: SearchResult = {
        path: fullPath,
        name: entry.name,
        isDirectory,
        size: entryStat.size,
        modifiedAt: entryStat.mtime
      };

      results.push(result);

      if (isDirectory) {
        await this.traverse(fullPath, results, ignoreManager, options, searchRegex);
      }
    });

    await Promise.all(tasks);
  }
}
