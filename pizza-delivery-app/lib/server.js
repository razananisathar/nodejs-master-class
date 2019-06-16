/**
 * @module lib/server
 */

/** Module dependencies */
const http = require('http');
const path = require('path');
const url = require('url');
const fs = require('fs');
const util = require('util');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');
const handlers = require('./handlers');
const helpers = require('./helpers');
const debuglog = util.debuglog('server');

 /** Instantiate the server module object */
const server = {};

server.httpServer = http.createServer((req, res) => server.unifiedServer(req, res));

server.unifiedServer = (req, res) => {
  const {pathname, query} = url.parse(req.url, true);
  const trimmedPath = pathname.replace(/^\/+|\/+$/g, '');
  const method = req.method.toLowerCase();
  const headers = req.headers;

  const decoder = new StringDecoder('utf8');
  let buffer = '';

  req.on('data', (data) => buffer += decoder.write(data));

  req.on('end', () => {
    buffer += decoder.end();

    const choosenHandler = typeof(server.routers[trimmedPath]) !== 'undefined' ?  server.routers[trimmedPath] : handlers.notFound;

    const data = {
      trimmedPath,
      method,
      headers,
      'queryStringObject': query,
      'payload': helpers.parseJSONToObject(buffer)
    };

    choosenHandler(data, (statusCode, payload) => {
        statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
        payload = typeof(payload) == 'object'? payload : {};
        const payloadString = JSON.stringify(payload);

        res.setHeader('Content-Type', 'application/json');
        res.writeHead(statusCode);
        res.end(payloadString);

        // Log the request/response, if the response is 200 print green and otherwise print red.
        if(statusCode == 200) debuglog('\x1b[32m%s\x1b[0m',`${method.toUpperCase()}/${trimmedPath} ${statusCode}`);
        else debuglog('\x1b[31m%s\x1b[0m', `${method.toUpperCase()} /${trimmedPath} ${statusCode}`);
    });
  });
};

/** Routers */
server.routers = {
  'api/users': handlers.users,
  'api/tokens': handlers.tokens,
  'api/menu': handlers.menu,
  'api/items': handlers.items,
  'api/carts': handlers.carts,
  'api/orders': handlers.orders
};

/** Server init */
server.init = () => {
  server.httpServer.listen(config.httpPort, () => console.log('\x1b[36m%s\x1b[0m', `The server is listening on port ${config.httpPort}`));
}

module.exports = server;
