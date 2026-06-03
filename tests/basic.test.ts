import { describe, it, expect } from 'vitest';
import { FileFinder } from '../src/index.js';

describe('FileFinder', () => {
  it('should be instantiable', () => {
    const finder = new FileFinder();
    expect(finder).toBeDefined();
  });
});
