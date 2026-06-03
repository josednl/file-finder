# Project Context: File Finder

This document serves as the foundational mandate for Gemini CLI when working on this project.

## Technical Stack

* **Runtime**: Node.js (ESM)
* **Language**: TypeScript
* **Runner**: tsx (preferred over ts-node)
* **Testing**: Vitest
* **CLI Exportable**: The project should work both as a CLI tool and as a programmatic API.
* **Module Formats**: ESM and CommonJS support.
* **Git**: Conventional Commits
* **Package Manager**: pnpm

## Project Goals

* **Educational First**: The main objective is learning how file discovery systems and filesystem traversal work internally.
* **Minimalist Design**: Keep the implementation understandable, modular, and easy to reason about.
* **Incremental Complexity**: Features should be implemented progressively without sacrificing readability.
* **Developer Experience**: Provide clear logs, predictable behavior, and maintainable architecture.
* **Cross-Platform Compatibility**: Ensure consistent behavior across Windows, Linux, and macOS.

## Architecture

* **Object-Oriented Design**: Structure the project around core classes.

* **Pipeline-Based Search System**:

  1. Discover directories
  2. Traverse filesystem
  3. Apply ignore rules
  4. Match patterns
  5. Apply filters
  6. Collect results

* **Search Engine Responsibilities**:

  * Filesystem traversal
  * Pattern matching
  * Ignore rule evaluation
  * Result aggregation
  * Search optimization

* **CLI Entry Point**:

  * `src/index.ts`
  * Example usage:

    ```bash
    file-finder src --pattern "*.ts"
    ```

## Search Capabilities

The finder should support:

* Exact filename matching
* Glob patterns
* Regular expressions
* Extension filtering
* Case-sensitive and case-insensitive search
* Recursive directory traversal
* Multiple search roots
* Hidden file handling
* Symlink handling
* Include and exclude patterns

## Ignore System

The finder should support:

* `.gitignore` parsing
* Custom ignore files
* Programmatic ignore rules
* Directory exclusion
* File exclusion
* Ignore rule precedence

## Filtering System

The filtering pipeline should support:

* File extension filtering
* File size filtering
* Modified date filtering
* Created date filtering
* Directory-only searches
* File-only searches
* Custom user-defined filters

## API Design

The library should expose a clean API:

```ts
const finder = new FileFinder();

const results = await finder.search({
  root: "./src",
  pattern: "*.ts",
});
```

API design principles:

* Promise-based
* Fully typed
* Composable options
* Predictable behavior
* Minimal configuration

## Coding Standards

* **Imports**: Always include the `.js` extension in local imports (ESM requirement).
* **Types**: Use `import type` for type-only imports to satisfy `verbatimModuleSyntax`.
* **Naming**:
  * PascalCase for classes
  * camelCase for methods and variables
  * UPPER_SNAKE_CASE for constants
* **Small Classes & Single Responsibility**:
  * Each core class should have a focused and isolated responsibility.
* **Atomic Commits**:
  * Each commit must represent a single logical and functional change.
  * Ensure all tests pass before committing.
* **Language**:
  * Source code in English
  * Documentation in English
  * CLI messages in English
  * Comments in English

## Key Workflows

* **PowerShell Commands**: Do not use `&&` as it is not supported in all PowerShell versions. To simulate `&&`, use the pattern `command1; if ($?) { command2 }`.

* **Pre-commit**: Always run pnpm run precommit before any commit. This ensures:

  1. No TypeScript errors (tsc --noEmit).
  2. All tests pass (vitest --run).

* **Documentation**: Always update GEMINI.md and README.md after significant changes or when new patterns are established.

## Testing

* Use **Vitest** for unit and integration tests.
* Test the full search pipeline end-to-end.
* Cover edge cases for:

  * symbolic links
  * permission errors
  * deeply nested directories
  * hidden files
  * invalid patterns
  * ignore rule precedence
  * empty directories
  * large directory trees
  * cross-platform path normalization

## Performance Principles

* Prioritize readability over micro-optimizations.
* Avoid premature optimization.
* Optimize only when measurable bottlenecks appear.
* Prefer streaming and iterative traversal over loading entire trees into memory.

## Potential Future Optimizations

* Parallel directory traversal
* Result caching
* Incremental indexing
* Persistent search indexes
* Worker thread support
* Search cancellation via AbortSignal

## Error Handling Principles

* Errors should be descriptive and actionable.
* Permission errors should not stop the entire search.
* Invalid patterns should produce clear validation messages.
* Unexpected filesystem errors should be surfaced predictably.

## Skills & Principles

* **Filesystem Fundamentals**: Understand directory traversal, file metadata, symbolic links, and permissions.
* **Pattern Matching**: Understand globbing, regex evaluation, and path normalization.
* **TypeScript Best Practices**: Maintain strong typing and API clarity.
* **Node.js Best Practices**: Use native filesystem APIs responsibly and efficiently.
* **DX First**: Error messages should be descriptive and actionable.

## Roadmap

* [x] **Project Bootstrap**: Configure TypeScript, Vitest, ESM, and CLI structure.
* [x] **Filesystem Traversal**: Implement recursive directory walking.
* [x] **Basic Pattern Matching**: Support exact filenames and glob patterns.
* [x] **Ignore System**: Add support for `.gitignore` and custom ignore rules.
* [x] **Advanced Filters**: Add size, date, and type filtering.
* [x] **Regex Search**: Support regular expression matching.
* [ ] **CLI Experience**: Add argument parsing and output formatting.
* [ ] **API Stabilization**: Finalize public API contracts.
* [ ] **Performance Improvements**: Optimize large directory traversal.
* [ ] **AbortSignal Support**: Allow cancellation of long-running searches.
* [ ] **Documentation & Examples**: Create educational examples explaining filesystem traversal internals.

## Evolution Notes

* [2026-05-29]: Initial Project Definition
  -> Reason: Established the architectural foundations and educational goals for the file finder.
  -> Implication: Future development should prioritize clarity, modularity, educational value, and predictable filesystem behavior over production-level complexity.
