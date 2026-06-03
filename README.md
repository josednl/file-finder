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

### CLI Usage

You can run the tool directly using `pnpm start`:

```bash
# Basic search
pnpm start .

# Search with pattern and ignore node_modules
pnpm start . --pattern "*.ts" --ignore node_modules

# Search with regex
pnpm start . --regex "test.*\.ts$"

# Filter by size and type
pnpm start ./src --min-size 1000 --files
```

#### CLI Options

* `<root>`: The directory to start the search from.
* `-p, --pattern <glob>`: Filter results by glob pattern.
* `-r, --regex <regex>`: Filter results by regular expression.
* `-i, --ignore <pattern>`: Add a pattern to ignore (can be used multiple times).
* `--gitignore`: Enable automatic `.gitignore` rule detection.
* `--min-size <bytes>`: Filter files by minimum size.
* `--max-size <bytes>`: Filter files by maximum size.
* `--files`: Show only files in results.
* `--dirs`: Show only directories in results.
* `-h, --help`: Show the help message.

## License

MIT
