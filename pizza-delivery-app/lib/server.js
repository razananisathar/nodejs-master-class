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
const htmlHandlers = require('./html-handlers');
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

    let choosenHandler = typeof(server.routers[trimmedPath]) !== 'undefined' ?  server.routers[trimmedPath] : handlers.notFound;

    // If the request is within the public directory use to the public handler instead.
    choosenHandler = trimmedPath.indexOf('public/') > -1 ? htmlHandlers.public : choosenHandler;

    const data = {
      trimmedPath,
      method,
      headers,
      'queryStringObject': query,
      'payload': helpers.parseJSONToObject(buffer)
    };

    choosenHandler(data, (statusCode, payload, contentType) => {
        statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

        // Determine the type of response (fallback to JSON).
        contentType = typeof(contentType) == 'string' ? contentType : 'json';

        let header, payloadString = '';

        // Return the response parts that are content-type specific.
        switch(contentType) {
          case 'html':
            header = 'text/html';
            payloadString = typeof(payload) == 'string'? payload : '';
            break;
          case 'favicon':
            header = 'image/x-icon';
            payloadString = typeof(payload) !== 'undefined' ? payload : '';
            break;
          case 'png':
            header = 'image/png';
            payloadString = typeof(payload) !== 'undefined' ? payload : '';
            break;
          case 'jpg':
            header = 'image/jpeg';
            payloadString = typeof(payload) !== 'undefined' ? payload : '';
            break;
          case 'plain':
            header = 'text/plain';
            payloadString = typeof(payload) !== 'undefined' ? payload : '';
            break;
          case 'css':
            header = 'text/css';
            payloadString = typeof(payload) !== 'undefined' ? payload : '';
            break;
          case 'json':
            header = 'application/json';
            payloadString = typeof(payload) == 'object'? payload : {};
            payloadString = JSON.stringify(payload);
            break;
        }

        res.setHeader('Content-Type', header);
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
  '': htmlHandlers.index,
  'menu': htmlHandlers.menu,
  'menu/item': htmlHandlers.item,
  'cart/checkout': htmlHandlers.checkout,
  'order/confirm': htmlHandlers.confirmOrder,
  'orders/all': htmlHandlers.allOrders,
  'account/signup': htmlHandlers.signup,
  'account/login': htmlHandlers.login,
  'account/settings': htmlHandlers.settings,
  'account/deleted': htmlHandlers.accountDeleted,
  'public' : htmlHandlers.public,
  'ping': handlers.ping,
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
