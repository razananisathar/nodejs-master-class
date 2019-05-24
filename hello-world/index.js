/*
 *  Homework Assignment #1: Hello World API
 *  Description:
 *    Create a simple "Hello World" API. Meaning:
 *     1. It should be a RESTful JSON API that listens on a port of your choice.
 *     2. When someone sends an HTTP request to the route /hello, you should return a welcome message, in JSON format. This message can be anything you want.
 *  Video Component: https://youtu.be/crOyVqJ4zYs
 */

// Dependencies
const http = require('http');
const urlParams = require('url');

// Configure the server to respond to all requests
const httpServer = http.createServer((req, res) => {
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
    const selectedHandler =  typeof(routers[trimmedPath]) !== 'undefined' ? routers[trimmedPath] : handlers.notFound;

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
       console.log("Returning this response: ", statusCode, payloadString);
     });
  });
});

// Start the server
httpServer.listen(3000, () => console.log('The server is up and running now'));

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
const routers = {
  'hello': handlers.hello
};
