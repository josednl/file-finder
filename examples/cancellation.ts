/**
 * Cancellation Example
 * 
 * For large filesystems, you might need to stop a search before it finishes.
 * This example shows how to use AbortController and AbortSignal.
 */

import { FileFinder } from '../src/index.js';

async function main() {
  const finder = new FileFinder();
  const controller = new AbortController();

  console.log('--- Cancellation Example ---');
  console.log('Starting a search and cancelling it almost immediately...\n');

  // Cancel the search after 50ms
  setTimeout(() => {
    console.log('>> Triggering cancellation...');
    controller.abort();
  }, 50);

  try {
    // Note: We search the root of the drive (or a very large dir) to ensure it takes time
    // On Windows, 'C:\\' is a good candidate, on Unix use '/'
    const root = process.platform === 'win32' ? 'C:\\' : '/';
    
    await finder.search({
      roots: root,
      signal: controller.signal,
      ignore: ['node_modules', '$Recycle.Bin', 'System Volume Information']
    });

    console.log('Search completed (this probably shouldn\'t happen if it was cancelled)');
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.log('✅ Search was successfully cancelled.');
    } else {
      console.error('Search failed with an unexpected error:', error);
    }
  }
}

main();
