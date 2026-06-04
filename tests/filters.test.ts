import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { FileFinder } from '../src/index.js';

describe('Advanced Filters', () => {
  const TEST_ROOT = './test-fixtures-filters';

  beforeEach(async () => {
    await mkdir(TEST_ROOT, { recursive: true });
    // Small file
    await writeFile(join(TEST_ROOT, 'small.txt'), 'a');
    // Larger file
    await writeFile(join(TEST_ROOT, 'large.txt'), 'a'.repeat(2000));
    
    await mkdir(join(TEST_ROOT, 'empty-dir'));
  });

  afterEach(async () => {
    await rm(TEST_ROOT, { recursive: true, force: true });
  });

  it('should filter by minimum file size', async () => {
    const finder = new FileFinder();
    const results = await finder.search({
      roots: TEST_ROOT,
      minSize: 1000, // 1KB
      onlyFiles: true
    });

    expect(results.length).toBe(1);
    expect(results[0].name).toBe('large.txt');
  });

  it('should filter by maximum file size', async () => {
    const finder = new FileFinder();
    const results = await finder.search({
      roots: TEST_ROOT,
      maxSize: 100, // 100 bytes
      onlyFiles: true
    });

    expect(results.length).toBe(1);
    expect(results[0].name).toBe('small.txt');
  });

  it('should filter by type (directories only)', async () => {
    const finder = new FileFinder();
    const results = await finder.search({
      roots: TEST_ROOT,
      onlyDirectories: true
    });

    // Should find TEST_ROOT subdirs (empty-dir)
    // Note: implementation might include the root itself or just subdirs
    expect(results.every(r => r.isDirectory)).toBe(true);
    expect(results.some(r => r.name === 'empty-dir')).toBe(true);
  });
});
