/**
 * @module base app
 */

/** Module Dependencies */
const server = require('./lib/server');
const workers = require('./lib/workers');
const cli = require('./lib/cli');

/** Instantiate app module object */
const app = {};

/** App init. */
app.init = () => {
  // Start the server.
  server.init();

  // Start the background workers.
  workers.init();

  // Start the CLI app.
  setTimeout(() => cli.init(), 50);
};

/** Execute the app. */
app.init();

module.exports = app;
