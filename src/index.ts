import { readdir, stat } from 'node:fs/promises';
import { join, basename } from 'node:path';

export interface SearchResult {
  path: string;
  name: string;
  isDirectory: boolean;
}

export interface SearchOptions {
  root: string;
  pattern?: string;
}

export class FileFinder {
  async search(options: SearchOptions): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    await this.traverse(options.root, results);

    if (options.pattern && options.pattern !== '*') {
      const regex = this.globToRegex(options.pattern);
      return results.filter(result => regex.test(result.name));
    }

    return results;
  }

  private globToRegex(glob: string): RegExp {
    // Escape regex special characters, but keep * and ?
    const escaped = glob.replace(/[.+^${}()|[\]\\]/g, '\\$&');
    const pattern = escaped
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');
    return new RegExp(`^${pattern}$`);
  }

  private async traverse(currentDir: string, results: SearchResult[]): Promise<void> {
    const entries = await readdir(currentDir);

    for (const entry of entries) {
      const fullPath = join(currentDir, entry);
      const entryStat = await stat(fullPath);

      if (entryStat.isDirectory()) {
        await this.traverse(fullPath, results);
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
