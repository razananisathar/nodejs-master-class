/**
 * @module server
 * Initiate http and https server module.
 */

// Dependencies
const http = require('http');
const urlParams = require('url');

const server = {};

// Configure the server to respond to all requests
server.httpServer = http.createServer((req, res) => {
  const { method, headers, url } = req;
  // Parse the url
  const parsedURL = urlParams.parse(url, true);
  // Get the path and query string as an object
  const { pathname, query } = parsedURL;
  const trimmedPath = pathname.replace(/^\/+|\/+$/g,'');

  req.on('data', () => {

  });

  req.on('end', () => {
     // Check the router for a matching path handler. If one is not found, use the notFound handler instead.
    const selectedHandler =  typeof(server.routers[trimmedPath]) !== 'undefined' ? server.routers[trimmedPath] : handlers.notFound;

    // Construct the data object to send to the handler
    const data = {
      'queryStringObject': query
    };

    // Route the request to the handler specified in the router
    selectedHandler(data, (statusCode, payload) => {
       statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
       payload = typeof(payload) == 'object'? payload : {};
       const payloadString = JSON.stringify(payload);

       // Return the response
       res.setHeader('Content-Type', 'application/json');
       res.writeHead(statusCode);
       res.end(payloadString);

       // Notify master about the request
       process.send({cmd: 'notifyRequest'});
     });
  });
});

// Define all the handlers
const handlers = {};

// Not found handler
handlers.notFound = (data, callback) => callback(404);

// Hello handler
handlers.hello = (data, callback) => {
  let { name } = data.queryStringObject;
  name = typeof(name) == 'string' && name.trim().length > 0 ? name.trim() : false;

  const message = `${(name) ? 'Hello ' + name +', ': ''}Welcome to Node.js Master Class`;
  callback(200, {'message':  message});
};

// Define the request router
server.routers = {
  'hello': handlers.hello
};

server.init = () => {
  // Start the server
  server.httpServer.listen(3000, () => console.log('\x1b[36m%s\x1b[0m', 'The server is up and running now'));
};

module.exports = server;
