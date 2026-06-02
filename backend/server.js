// Backward-compatible entrypoint.
// Keeping this file avoids breaking existing deployment commands,
// while the real production entrypoint is now `src/server.js`.
import './src/server.js';

