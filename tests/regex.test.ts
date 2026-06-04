import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { FileFinder } from '../src/index.js';

describe('Regex Search', () => {
  const TEST_ROOT = './test-fixtures-regex';

  beforeEach(async () => {
    await mkdir(TEST_ROOT, { recursive: true });
    await writeFile(join(TEST_ROOT, 'app.component.ts'), 'code');
    await writeFile(join(TEST_ROOT, 'app.service.ts'), 'code');
    await writeFile(join(TEST_ROOT, 'user-login.ts'), 'code');
  });

  afterEach(async () => {
    await rm(TEST_ROOT, { recursive: true, force: true });
  });

  it('should find files matching a regular expression', async () => {
    const finder = new FileFinder();
    const results = await finder.search({
      roots: TEST_ROOT,
      regex: /app\.(component|service)\.ts/
    });

    expect(results.length).toBe(2);
    const names = results.map(r => r.name).sort();
    expect(names).toEqual(['app.component.ts', 'app.service.ts'].sort());
  });

  it('should find files matching regex with digits', async () => {
    const finder = new FileFinder();
    await writeFile(join(TEST_ROOT, 'file123.txt'), 'content');
    
    const results = await finder.search({
      roots: TEST_ROOT,
      regex: /\d+/
    });

    expect(results.some(r => r.name === 'file123.txt')).toBe(true);
  });
});
