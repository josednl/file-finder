# File Finder

A minimalist, educational filesystem discovery tool and programmatic API built with Node.js and TypeScript.

## Goals

* **Educational**: Designed to learn how filesystem traversal and pattern matching work internally.
* **Minimalist**: Simple, modular implementation with zero external dependencies for core logic.
* **TypeScript First**: Fully typed API.

## Features

- [x] Recursive directory traversal.
- [x] Basic pattern matching (Glob support: `*`, `?`).
- [x] Asynchronous, Promise-based API.
- [x] ESM and NodeNext support.

## Installation

```bash
pnpm install
```

## Usage

### Programmatic API

```typescript
import { FileFinder } from './src/index.js';

const finder = new FileFinder();
const results = await finder.search({
  root: './src',
  pattern: '*.ts'
});

console.log(results);
```

### Development

```bash
# Run tests
pnpm test

# Type check and run tests (pre-commit check)
pnpm run precommit

# Build
pnpm run build
```

## License

MIT
