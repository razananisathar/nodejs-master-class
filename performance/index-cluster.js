/**
 *  @module app
 *
 */

// Dependencies
const server = require('./server');
const cluster = require('cluster');
const os = require('os');

const app = {};

app.init = () => {
  if(cluster.isMaster) {
    console.log('\x1b[31m%s\x1b[0m', `Master ${process.pid} is running`);

    let numOfRequests = 0;

    // Track http requests
    setInterval(() => {
      console.log('\x1b[33m%s\x1b[0m', `Total Requests = ${numOfRequests}`);
    }, 1000);

    // Count requests
    const countRequests = (msg) => {
        if(msg.cmd && msg.cmd == 'notifyRequest') {
          numOfRequests += 1;
        }
    };

    // Start workers and listen for messages containing notifyRequest
    for(let i = 0; i < os.cpus().length; i++) {
      cluster.fork();
    }

    for(const id in cluster.workers) {
      cluster.workers[id].on('message', countRequests);
    }

  } else {
    server.init();

    console.log('\x1b[31m%s\x1b[0m', `Worker ${process.pid} started`);
  }
};

app.init();

module.exports = app;
