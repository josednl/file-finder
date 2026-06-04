import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { FileFinder } from '../src/index.js';

describe('Basic Pattern Matching', () => {
  const TEST_ROOT = './test-fixtures-patterns';

  beforeEach(async () => {
    await mkdir(TEST_ROOT, { recursive: true });
    await writeFile(join(TEST_ROOT, 'file1.txt'), 'hello');
    await writeFile(join(TEST_ROOT, 'file2.js'), 'world');
    await writeFile(join(TEST_ROOT, 'README.md'), 'content');
  });

  afterEach(async () => {
    await rm(TEST_ROOT, { recursive: true, force: true });
  });

  it('should match exact filename', async () => {
    const finder = new FileFinder();
    const results = await finder.search({
      roots: TEST_ROOT,
      pattern: 'file1.txt'
    });

    expect(results.length).toBe(1);
    expect(results[0].name).toBe('file1.txt');
  });

  it('should match using glob pattern (*.js)', async () => {
    const finder = new FileFinder();
    const results = await finder.search({
      roots: TEST_ROOT,
      pattern: '*.js'
    });

    expect(results.length).toBe(1);
    expect(results[0].name).toBe('file2.js');
  });

  it('should return all files when pattern is *', async () => {
    const finder = new FileFinder();
    const results = await finder.search({
      roots: TEST_ROOT,
      pattern: '*'
    });

    expect(results.length).toBe(3);
  });
});
