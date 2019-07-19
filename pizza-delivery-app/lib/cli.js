/**
 * @module lib/cli
 * CLI application.
 * Admin related tasks.
 */

 /** Module dependencies */
const readline = require('readline');
const util = require('util');
const debug = util.debuglog('cli');
const os = require('os');
const v8 = require('v8');
const fs = require('fs');
const path = require('path');
const events = require('events');

class _events extends events {};
const e = new _events();

const _data = require('./data');
const helpers = require('./helpers');
const _logs = require('./logs');

/** Instantiate cli module object */
const cli = {};

cli.baseDir = path.join(__dirname, '/../.data/');

/** Input handlers */
e.on('exit', (str) => {
  cli.responders.exit();
});

e.on('help', (str) => {
  cli.responders.help();
});

e.on('man', (str) => {
  cli.responders.help();
});

e.on('stats', (str) => {
  cli.responders.stats();
});

e.on('list menu', (str) => {
  cli.responders.listMenu();
});

e.on('more menu info', (str) => {
  cli.responders.moreMenuInfo(str);
});

e.on('list orders', (str) => {
  cli.responders.listOrders();
});

e.on('more order info', (str) => {
  cli.responders.moreOrderInfo(str);
});

e.on('list users', (str) => {
  cli.responders.listUsers();
});

e.on('more user info', (str) => {
  cli.responders.moreUserInfo(str);
});

e.on('list logs', (str) => {
  cli.responders.listLogs();
});

e.on('more log info', (str) => {
  cli.responders.moreLogInfo(str);
});

/** Responders object */
cli.responders = {};

/** Exit */
cli.responders.exit = () => {
  process.exit(0);
};

/** Help / man */
cli.responders.help = () => {
  const commands = {
    'exit': 'Kill the CLI (and the rest of the application)',
    'help': 'Show this help page',
    'man': 'Alias of the "man" command',
    'stats': 'Get statistics on the underlying operating system and resource utilization',
    'list menu': 'Show a list of current menu items',
    'more menu info --{itemId}': 'Show details of a specific menu item',
    'list orders': 'Show a list of orders placed in the last 24 hours',
    'more order info --{orderId}': 'Show details of a specific order',
    'list users': 'Show a list of registered (undeleted) users who have signed up in the last 24 hours',
    'more user info --{userEmail}': 'Show details of the specific user',
    'list logs': 'Show a list of all the log files available to be read (compressed only)',
    'more log info --{fileName}': 'Show details of a specified log file'
  };

  // Show a header for the help page that is as wide as the screen.
  cli.horizontalLine();
  cli.centered('Manual');
  cli.horizontalLine();
  cli.verticalSpace(2);

  // Show each command, followed by its explanation, in white and yellow respectively.
  for(const key in commands) {
    if(commands.hasOwnProperty(key)) {
      const value = commands[key];

      let line = `\x1b[33m${key}\x1b[0m`;
      const padding = 60 - line.length;

      for(let i = 0; i <= padding; i++) {
        line += ' ';
      }

      line += value;
      console.log(line);
      cli.verticalSpace();
    }
  }

  cli.verticalSpace(1);
  cli.horizontalLine();
};

/** List stats */
cli.responders.stats = () => {
  // Compile an object of stats.
  const stats = {
      'Load Average': os.loadavg().join(''),
      'CPU Count': os.cpus().length,
      'Free Memory': os.freemem(),
      'Current Malloced Memory': v8.getHeapStatistics().malloced_memory,
      'Peak Malloced Memory': v8.getHeapStatistics().peak_malloced_memory,
      'Allocated Heap Used (%)': Math.round((v8.getHeapStatistics().used_heap_size / v8.getHeapStatistics().total_heap_size) * 100),
      'Available Heap Allocated (%)': Math.round((v8.getHeapStatistics().total_heap_size / v8.getHeapStatistics().used_heap_size) * 100),
      'Uptime': `${os.uptime()} seconds`
  };

  cli.horizontalLine();
  cli.centered('System Statistics');
  cli.horizontalLine();
  cli.verticalSpace(2);

  for(const key in stats) {
    if(stats.hasOwnProperty(key)) {
      const value = stats[key];
      let line = `\x1b[33m${key}\x1b[0m`;

      const padding = 60 - line.length;

      for(let i = 0; i <= padding; i++) {
        line += ' ';
      }

      line += value;
      console.log(line);
      cli.verticalSpace();
    }
  }

  cli.verticalSpace(1);
};

/** List menu items */
cli.responders.listMenu = () => {
  _data.read('menu', 'pizza', (err, menuData) => {
    if(!err && menuData && menuData.length > 0) {
      cli.verticalSpace();

      for(const { id, name, description, prices, vegetarian, image} of menuData) {
        let line = `ID: ${id}\nName: ${name}\nDescription: ${description}\nType: ${(vegetarian) ?'veg' : 'non-veg'}\nPan Prices:\n`;

          let count = 1;
          for(const { pan, price } of prices) {
            line += ` size: ${pan}, price: ${price}${(count == 3) ? '' : '\n'}`
            count++;
          }

          console.log(line);
          cli.verticalSpace();
      }
    }
  });
};

/** More menu info */
cli.responders.moreMenuInfo = (str) => {
  // Get item id from str.
  const arr = str.split('--');
  const itemId = typeof(arr[1]) == 'string' && arr[1].trim().length > 0 ? arr[1].trim() : false;

  if(itemId) {
    _data.read('menu', 'pizza', (err, menuData) => {
      if(!err && menuData) {
          const item = menuData.filter(item => item.id == itemId);
          if(item.length == 1) {
              const itemData = item[0];

              cli.verticalSpace();
              console.dir(itemData, { 'colors' : true });
              cli.verticalSpace();
          }
      }
    });
  }
};

/** List orders */
cli.responders.listOrders = () => {

  const now = new Date().getTime();
  const endTime = now - (24 * 60 * 60 * 1000);

  _data.list('orders', (err, orderIds) => {
      if(!err && orderIds && orderIds.length > 0) {
        cli.verticalSpace();

        orderIds.forEach(orderId => {
          // Get file stats.
          fs.stat(`${cli.baseDir}orders/${orderId}.json`, (err, stats) => {
            if(err) console.error(err);
            else {
              // Get the file created time in milliseconds.
              const birthtime = new Date(stats.birthtime).getTime();

              // Get the orders placed in the last 24 hours.
              if(birthtime < now && birthtime >= endTime) {
                _data.read('orders', orderId, (err, orderData) => {
                  if(!err && orderData) {

                    const { id, email, cartId, receipt, deliveredId = false, payment, chargeId = false } = orderData;
                    let line = `Order ID: ${id}\nEmail: ${email}\nCart ID: ${cartId}\nReceipt Status: ${receipt}\nDelivered ID: ${(receipt == 'sent') ? receipt : false}\nPayment Status: ${payment}\nStripe Charge ID: ${(payment == 'succeeded') ? chargeId : false}`;

                    console.log(line);
                    cli.verticalSpace();
                  }
                });
              }
            }
          });
        });
      }
  });
};

/** More order info */
cli.responders.moreOrderInfo = (str) => {
  // Get the order id from str
  const arr = str.split('--');
  const orderId = typeof(arr[1]) == 'string' && arr[1].trim().length > 0 ? arr[1].trim() : false;

  if(orderId) {
    _data.read('orders', orderId, (err, orderData) => {
      if(!err && orderData) {
        const { cartId, payment, receipt, chargeId = false, deliveredId = false } = orderData;
        // Set default values.
        if(!chargeId) orderData['chargeId'] = chargeId;
        if(!deliveredId) orderData['deliveredId'] = deliveredId;

        // Get the cart items and total.
        _data.read('carts', cartId, (err, cartData) => {
          if(!err && cartData) {
            const { items = [], total = 0 } = cartData;

            orderData['items'] = items;
            orderData['total'] = total;

            cli.verticalSpace();
            console.dir(orderData, { 'colors': true });
            cli.verticalSpace();
          }
        });
      }
    });
  }
};

/** List users */
cli.responders.listUsers = () => {
  const now = new Date().getTime();
  const endTime = now - (24 * 60 * 60 * 1000);

  _data.list('users', (err, userIds) => {
      if(!err && userIds && userIds.length > 0) {
        cli.verticalSpace();

        userIds.forEach(userId => {
          // Get file stats.
          fs.stat(`${cli.baseDir}users/${userId}.json`, (err, stats) => {
            if(err) console.error(err);
            else {
              // Get the file created time in milliseconds.
              const birthtime = new Date(stats.birthtime).getTime();


              // Get users signed up in the last 24 hours.
              if(birthtime < now && birthtime >= endTime) {
                // Get user data.
                _data.read('users', userId, (err, userData) => {
                  if(!err && userData) {
                    delete userData.hashPassword;

                    const { firstName, lastName, email, address, city, state, postalCode, cartId = false, orders = []} = userData;
                    let line = `FirstName: ${firstName}\nLast Name: ${lastName}\nEmail: ${email}\nAddress: ${address}\nCity: ${city}\nState: ${state}\nPostal Code: ${postalCode}\nActive Cart ID: ${cartId}\n`;

                    const numberOfOrders = typeof(orders) == 'object' && orders instanceof Array && orders.length > 0 ? orders.length : 0;

                    line += `Number of orders: ${numberOfOrders}`;

                    console.log(line);
                    cli.verticalSpace();
                  }
                });
              }
            }
          });
        });
      }
  });
};

/** More user info */
cli.responders.moreUserInfo = (str) => {
  // Get the email from str.
  const arr = str.split('--');
  const email = typeof(arr[1]) == 'string' && arr[1].trim().length > 0 ? arr[1].trim() : false;

  if(email) {
    _data.read('users', email, (err, userData) => {
      if(!err && userData) {
          delete userData.hashPassword;

          const { cartId = false, orders = [] } = userData;

          // Set default values.
          if(!orders.length) userData['orders'] = orders;

          // If there is an active cart, then get cart data.
          if(cartId) {
            _data.read('carts', cartId, (err, cartData) => {
              if(!err && cartData) {
                const { items = [], total = 0 } = cartData;

                userData['items'] = items;
                userData['total'] = total;

                cli.verticalSpace();
                console.dir(userData, { 'colors': true });
                cli.verticalSpace();
              }
            });
          } else {
              userData['cartId'] = cartId;

              cli.verticalSpace();
              console.dir(userData, { 'colors': true });
              cli.verticalSpace();
          }
      }
    });
  }
};

/** List logs */
cli.responders.listLogs = () => {
  _logs.list(true, (err, logFileNames) => {
    if(!err && logFileNames && logFileNames.length > 0) {
      cli.verticalSpace();

      logFileNames.forEach(logFileName => {
        if(logFileName.indexOf('-') > -1) {
          console.log(logFileName);
          cli.verticalSpace();
        }
      });
    }
  });
};

/** More log info */
cli.responders.moreLogInfo = (str) => {
  // Get log file name from str.
  const arr = str.split('--');
  const logFileName = typeof(arr[1]) == 'string' && arr[1].trim().length > 0 ? arr[1].trim() : false;

  if(logFileName) {
    cli.verticalSpace();

    _logs.decompress(logFileName, (err, strData) => {
      if(!err && strData) {
        const  arr = strData.split('\n');
        arr.forEach(jsonString => {
          const logObject = helpers.parseJSONToObject(jsonString);

          if(logObject && JSON.stringify(logObject) !== '{}') {
            console.dir(logObject, { 'colors' : true});
            cli.verticalSpace();
          }
        })
      }
    });
  }
};

/** Create a horizontal line across the screen. */
cli.horizontalLine = () => {
  // Get the available screen size.
  const width = process.stdout.columns;
  let line = '';

  for(let i = 0; i < width; i++) {
    line += '-';
  }

  console.log(line);
};

/**
 * Add vertical spaces on the screen.
 * @param {lines} number - number of vertical spaces.
 */
cli.verticalSpace = (lines) => {
  lines = typeof(lines) == 'numbers' && lines > 0 ? lines : 1;

  for(let i = 0; i < lines; i++) {
    console.log(' ');
  }
};

/**
 * Create centered text on the screen.
 * @param {str} string - center aligned string
 */
cli.centered = (str) => {
  str = typeof(str) == 'string' && str.trim().length > 0 ? str.trim() : false;

  // Get the available screen size.
  const width = process.stdout.columns;

  // Calculate the left padding there should be.
  const leftPadding = Math.floor((width - str.length)/2);

  // Put in left padded spaces before the string itself.
  let line = ' ';

  for(let i = 0; i <= leftPadding; i++) {
    line += ' ';
  }

  line += str;
  console.log(line);
};

/**
 * Input processor.
 * @param {str} String - CLI input value.
 */
cli.processInput = (str) => {
  str = typeof(str) == 'string' && str.trim().length > 0 ? str.trim() : false;

  if(str) {
    const uniqueInputs = [
      'exit',
      'help',
      'man',
      'stats',
      'list menu',
      'more menu info',
      'list orders',
      'more order info',
      'list users',
      'more user info',
      'list logs',
      'more log info'
    ]

    // Go through the possible inputs, emit an event when a match is found.
    let matchFound = false;

    uniqueInputs.some(input => {
      if(str.toLowerCase().indexOf(input) > -1) {
        matchFound = true;

        // Emit an event matching the unique input, and include the full string given by the user.
        e.emit(input, str);
        return true;
      }
    });

    if(!matchFound) console.log('sorry, try again');
  }
};

/** Cli init */
cli.init = () => {
  // Send the start message in dark blue in console.
  console.log('\x1b[34m%s\x1b[0m', 'The CLI is running');

  // Start the interface.
  const _interface = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: '> '
  });

  // Create an initial prompt.
  _interface.prompt();

  // Handle each line of input seperately.
  _interface.on('line', (str) => {
    cli.processInput(str);

    _interface.prompt();
  });

  // If the user stops the CLI, kill the associated process.
  _interface.on('close', () => process.exit(0));

};

module.exports = cli;
