import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { FileFinder } from '../src/index.js';

describe('Ignore System', () => {
  const TEST_ROOT = './test-fixtures-ignore';

  beforeEach(async () => {
    await mkdir(TEST_ROOT, { recursive: true });
    await mkdir(join(TEST_ROOT, 'node_modules'));
    await mkdir(join(TEST_ROOT, 'src'));
    
    await writeFile(join(TEST_ROOT, 'node_modules/secret.txt'), 'hidden');
    await writeFile(join(TEST_ROOT, 'src/app.ts'), 'code');
    await writeFile(join(TEST_ROOT, 'build.log'), 'logs');
    await writeFile(join(TEST_ROOT, '.gitignore'), 'node_modules\n*.log');
  });

  afterEach(async () => {
    await rm(TEST_ROOT, { recursive: true, force: true });
  });

  it('should respect programmatic ignore rules', async () => {
    const finder = new FileFinder();
    const results = await finder.search({
      roots: TEST_ROOT,
      pattern: '*',
      ignore: ['node_modules']
    });

    const paths = results.map(r => r.path);
    expect(paths.some(p => p.includes('node_modules'))).toBe(false);
    expect(paths.some(p => p.includes('app.ts'))).toBe(true);
  });

  it('should automatically load and respect .gitignore if present', async () => {
    const finder = new FileFinder();
    const results = await finder.search({
      roots: TEST_ROOT,
      pattern: '*',
      useGitignore: true
    });

    const paths = results.map(r => r.path);
    // Should ignore node_modules and *.log based on .gitignore
    expect(paths.some(p => p.includes('node_modules'))).toBe(false);
    expect(paths.some(p => p.includes('build.log'))).toBe(false);
    expect(paths.some(p => p.includes('app.ts'))).toBe(true);
  });
});
