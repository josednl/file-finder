import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { FileFinder } from '../src/index.js';

describe('Filesystem Traversal', () => {
  const TEST_ROOT = './test-fixtures-traversal';

  beforeEach(async () => {
    await mkdir(TEST_ROOT, { recursive: true });
    await mkdir(join(TEST_ROOT, 'dir1'));
    await mkdir(join(TEST_ROOT, 'dir2/nested'), { recursive: true });
    await writeFile(join(TEST_ROOT, 'file1.txt'), 'hello');
    await writeFile(join(TEST_ROOT, 'dir1/file2.txt'), 'world');
    await writeFile(join(TEST_ROOT, 'dir2/nested/file3.txt'), 'content');
  });

  afterEach(async () => {
    await rm(TEST_ROOT, { recursive: true, force: true });
  });

  it('should find all files in a recursive directory structure', async () => {
    const finder = new FileFinder();
    const results = await finder.search({
      roots: TEST_ROOT,
      pattern: '*',
      onlyFiles: true
    });

    expect(results.length).toBe(3);
    const names = results.map(r => r.name).sort();
    expect(names).toEqual(['file1.txt', 'file2.txt', 'file3.txt'].sort());
  });

  it('should support multiple search roots', async () => {
    const ROOT1 = './test-roots-1';
    const ROOT2 = './test-roots-2';
    
    await mkdir(ROOT1, { recursive: true });
    await mkdir(ROOT2, { recursive: true });
    await writeFile(join(ROOT1, 'a.txt'), 'a');
    await writeFile(join(ROOT2, 'b.txt'), 'b');

    const finder = new FileFinder();
    const results = await finder.search({
      roots: [ROOT1, ROOT2],
      onlyFiles: true
    });

    try {
      expect(results.length).toBe(2);
      const names = results.map(r => r.name).sort();
      expect(names).toEqual(['a.txt', 'b.txt']);
    } finally {
      await rm(ROOT1, { recursive: true, force: true });
      await rm(ROOT2, { recursive: true, force: true });
    }
  });
});
