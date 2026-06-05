import { describe, it, expect, vi } from 'vitest';
import { FileFinder } from '../src/index.js';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';

describe('FileFinder AbortSignal', () => {
  const testDir = join(process.cwd(), 'tests-abort');

  it('should abort search when signal is aborted', async () => {
    // Setup a deep directory structure to ensure search takes some time
    await mkdir(testDir, { recursive: true });
    for (let i = 0; i < 10; i++) {
      const subDir = join(testDir, `dir-${i}`);
      await mkdir(subDir, { recursive: true });
      for (let j = 0; j < 10; j++) {
        await writeFile(join(subDir, `file-${j}.txt`), 'test');
      }
    }

    const finder = new FileFinder();
    const controller = new AbortController();
    
    // Start search and abort immediately or after a short delay
    const searchPromise = finder.search({
      roots: testDir,
      signal: controller.signal
    });

    controller.abort();

    await expect(searchPromise).rejects.toThrow();

    // Cleanup
    await rm(testDir, { recursive: true, force: true });
  });
});
