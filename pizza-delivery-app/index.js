/**
 * @module base app
 */

/** Module Dependencies */
const server = require('./lib/server');
const workers = require('./lib/workers');

/** Instantiate app module object */
const app = {};

// App init.
app.init = () => {
  // Start the server.
  server.init();

  // Start the background workers.
  workers.init();
};

/** Execute the app. */
app.init();

module.exports = app;
