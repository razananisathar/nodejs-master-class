/**
 * @module lib/workers
 * Background workers.
 */

/** Module dependencies */
 const _data = require('./data');
 const util = require('util');
 const _logs = require('./logs');
 const debug = util.debuglog('workers');

/** Instantiate the worker module object */
 const workers = {};

/**
 * Lookup all orders, get their data, send to validator.
 */
workers.gatherAllOrders = () => {
  _data.list('orders',(err, orders) => {
    if(!err && orders && orders.length > 0 ) {
      orders.forEach((order) => {
        _data.read('orders', order, (err, orderData) => {
          if(!err && orderData) {
            // Pass it to the order validator, and let that function continue the function or log the error(s) as needed.
            workers.performOrderCheck(orderData);
          } else debug("Error reading one of the order's data: ", err);
        });
      });
    } else debug('Error: Could not find any orders to process.');
  });
};

/**
 * Check order related data.
 * @param {orderData} object - order data
 */
workers.performOrderCheck = (orderData) => {
  orderData = typeof(orderData) == 'object' && orderData !== null ? orderData : {};

  let { id, email, cartId, payment, chargeId, receipt, deliveredId } = orderData;

  id = typeof(id) == 'string' && id.trim().length == 20 ? id.trim() : false;
  email = typeof(email) == 'string' && email.trim().length > 0 ? email.trim() : false;
  cartId = typeof(cartId) == 'string' && cartId.trim().length == 20 ? cartId.trim() : false;
  payment = typeof(payment) == 'string' && ['pending', 'succeeded', 'failed'].indexOf(payment) > 0 ? payment : false;
  chargeId = typeof(chargeId) == 'string' && chargeId.trim().length > 0 ? chargeId.trim() : false;
  receipt = typeof(receipt) == 'string' && ['pending', 'sent', 'failed'].indexOf(receipt) > 0 ? receipt : false;
  deliveredId = typeof(deliveredId) == 'string' && deliveredId.trim().length > 0 ? deliveredId.trim() : false;

  // If all checks pass, pass the data along to the next step in the process.
  if(id && email && cartId && payment && chargeId && receipt && deliveredId) {

    if(payment == 'failed' || receipt == 'failed') {
      _data.read('carts', cartId, (err, cartData) => {
          if(!err && cartData) {
            workers.log(orderData, cartData);
          } else debug('Could not find the cart related to given order.');
      });
    }
  } else debug("Error: one of the orders is not properly formatted. Skipping.");
};

/**
 * Perform order check.
 *
 */
workers.log = (orderData, cartData) => {
  const { id, email, cartId, payment, chargeId, receipt, deliveredId } = orderData;
  const { items, total } = cartData;

  const logData = {
    'orderId' : id,
    email,
    cartId,
    items,
    total,
    payment,
    chargeId,
    receipt,
    deliveredId
  };

  const logString = JSON.stringify(logData);

  // Determine the name of the log file.
  const logFileName = id;

  // Append the log string to the file.
  _logs.append(logFileName, logString, (err) => {
    if(!err) debug("Logging to file succeeded.");
    else debug("Logging to file failed.");
  });
};

/**
 * Timer to execute the worker-process once per hour.
 */
workers.loop = () => {
  setInterval(() => {
    workers.gatherAllOrders();
  },1000 * 60 * 60);
};

/**
 * Rotate (compress) the log files.
 */
workers.rotateLogs = () => {
  // List all the (non compressed) log files.
  _logs.list(false, (err, logs) => {
    const len = logs.length;
    if(!err && logs && len > 0){
        logs.forEach( logName => {
            // Compress the data to a different file.
            const logId = logName.replace('.log','');
            const newFileId = `${logId}-${Date.now()}`;

            _logs.compress(logId, newFileId, (err) => {
              if(!err) {
                // Truncate the log.
                _logs.truncate(logId, (err) => {
                  if(!err) debug('Successfully truncated log file.');
                  else debug('Error truncating the log file.');
                });

              } else debug(`Error compressing one of the log files. ${err}`);
            });
        });
    } else debug('Could not find any logs to rotate');
  });
};

/**
 * Timer to execute the log-rotation process once per day.
 */
workers.logRotationLoop = () => {
  setInterval(() => {
     workers.rotateLogs();
  }, 1000 * 60 * 60 * 24); 
};

/**
 * Workers init.
 */
workers.init = () => {
  // Send to console, in yellow.
  console.log('\x1b[33m%s\x1b[0m','Background workers are running');

  // Execute all the orders check immediately.
  workers.gatherAllOrders();

  // Call the loop so the checks will execute later on.
  workers.loop();

  // Compress all the logs immediately.
  workers.rotateLogs();

  // Call the compression loop so checks will execute later on.
  workers.logRotationLoop();
};

module.exports = workers;
