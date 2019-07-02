/**
 * @module lib/html-handlers
 * HTML router handler functions.
 */

/** Module dependencies */
const _data = require('./data');
const helpers = require('./helpers');

 /** Instantiate the html handlers module object */
const handlers = {};

/** Index page handler.
 * @param {data} object - request data
 * @param {data.method} string - request method
 */
handlers.index = (data, callback) => {
  const { method } = data;

  // Reject any request that isn't a GET.
  if(method == 'get') {
     const templateData = {
       'page.title': 'Order Pizza Online',
       'page.description': 'The easiest pizza order service. Order now and get your pizza to your doorsteps in few  minutes.',
       'page.bodyClass': 'index',
       'page.bodyId': 'index',
     };

     // Read in a template as a string.
     helpers.getTemplate('index', templateData, (err, str) => {
       if(!err && str) {
          // Add the universal header and footer.
          helpers.addUniversalTemplate(str, templateData, (err, str) => {
            if(!err && str) callback(200, str, 'html');
            else callback(500, undefined, 'html');
          });
       } else callback(500, undefined, 'html');
     });
  } else callback(405, undefined, 'html');
};

/** Menu page handler.
 * @param {data} object - request data
 * @param {data.method} string - request method
 */
handlers.menu = (data, callback) => {
  const { method } = data;

  // Reject any request that isn't a GET.
  if(method == 'get') {
     const templateData = {
       'page.title': 'Pizza Menu',
       'page.description': 'We have a choice to suit everyone\’s taste. Our pizza menu is vast & delicious!',
       'page.bodyClass': 'menu',
       'page.bodyId': 'menu',
     };

     // Read in a template as a string.
     helpers.getTemplate('menu', templateData, (err, str) => {
       if(!err && str) {
          // Add the universal header and footer.
          helpers.addUniversalTemplate(str, templateData, (err, str) => {
            if(!err && str) callback(200, str, 'html');
            else callback(500, undefined, 'html');
          });
       } else callback(500, undefined, 'html');
     });
  } else callback(405, undefined, 'html');
};

/** Item page handler.
 * @param {data} object - request data
 * @param {data.method} string - request method
 */
handlers.item = (data, callback) => {
  const { method, queryStringObject } = data;
  const { name } = queryStringObject;

  // Reject any request that isn't a GET.
  if(method == 'get') {
     const templateData = {
       'page.title': name,
       'page.description': '',
       'page.bodyId': 'item',
       'page.bodyClass': 'item',
     };

     // Read in a template as a string.
     helpers.getTemplate('item', templateData, (err, str) => {
       if(!err && str) {
          // Add the universal header and footer.
          helpers.addUniversalTemplate(str, templateData, (err, str) => {
            if(!err && str) callback(200, str, 'html');
            else callback(500, undefined, 'html');
          });
       } else callback(500, undefined, 'html');
     });
  } else callback(405, undefined, 'html');
};

/** Cart page handler.
 * @param {data} object - request data
 * @param {data.method} string - request method
 */
handlers.checkout = (data, callback) => {
  const { method } = data;

  // Reject any request that isn't a GET.
  if(method == 'get') {
     // Prepare data for interpolation @TODO add contents.
     const templateData = {
       'page.title': 'Shopping Cart Checkout',
       'page.description': 'Checkout now to place your order.',
       'page.bodyId': 'cart',
       'page.bodyClass': 'cart',
     };

     // Read in a template as a string.
     helpers.getTemplate('checkout', templateData, (err, str) => {
       if(!err && str) {
          // Add the universal header and footer.
          helpers.addUniversalTemplate(str, templateData, (err, str) => {
            if(!err && str) callback(200, str, 'html');
            else callback(500, undefined, 'html');
          });
       } else callback(500, undefined, 'html');
     });
  } else callback(405, undefined, 'html');
};

/** Order confirmation page handler.
 * @param {data} object - request data
 * @param {data.method} string - request method
 */
handlers.confirmOrder = (data, callback) => {
  const { method } = data;

  // Reject any request that isn't a GET.
  if(method == 'get') {
     // Prepare data for interpolation @TODO add contents.
     const templateData = {
       'page.title': 'Order Confirmation',
       'page.description': 'Your order placed successfully.',
       'page.bodyId': 'confirmOrder',
       'page.bodyClass': '',
     };

     // Read in a template as a string.
     helpers.getTemplate('order-confirmation', templateData, (err, str) => {
       if(!err && str) {
          // Add the universal header and footer.
          helpers.addUniversalTemplate(str, templateData, (err, str) => {
            if(!err && str) callback(200, str, 'html');
            else callback(500, undefined, 'html');
          });
       } else callback(500, undefined, 'html');
     });
  } else callback(405, undefined, 'html');
};

/**Orders page handler.
 * @param {data} object - request data
 * @param {data.method} string - request method
 */
handlers.allOrders = (data, callback) => {
  const { method } = data;

  // Reject any request that isn't a GET.
  if(method == 'get') {
     // Prepare data for interpolation @TODO add contents.
     const templateData = {
       'page.title': 'Orders',
       'page.description': '',
       'page.bodyId': 'allOrders',
       'page.bodyClass': 'allOrders',
     };

     // Read in a template as a string.
     helpers.getTemplate('orders', templateData, (err, str) => {
       if(!err && str) {
          // Add the universal header and footer.
          helpers.addUniversalTemplate(str, templateData, (err, str) => {
            if(!err && str) callback(200, str, 'html');
            else callback(500, undefined, 'html');
          });
       } else callback(500, undefined, 'html');
     });
  } else callback(405, undefined, 'html');
};


/** Sign up page handler.
 * @param {data} object - request data
 * @param {data.method} string - request method
 */
handlers.signup = (data, callback) => {
  const { method } = data;

  // Reject any request that isn't a GET.
  if(method == 'get') {
     const templateData = {
       'page.title': 'Sign up',
       'page.description': 'Create an account to place your order.',
       'page.bodyClass': 'signup',
       'page.bodyId': 'signup',
     };

     // Read in a template as a string.
     helpers.getTemplate('signup', templateData, (err, str) => {
       if(!err && str) {
          // Add the universal header and footer.
          helpers.addUniversalTemplate(str, templateData, (err, str) => {
            if(!err && str) callback(200, str, 'html');
            else callback(500, undefined, 'html');
          });
       } else callback(500, undefined, 'html');
     });
  } else callback(405, undefined, 'html');
};

/** Login page handler.
 * @param {data} object - request data
 * @param {data.method} string - request method
 */
handlers.login = (data, callback) => {
  const { method } = data;

  // Reject any request that isn't a GET.
  if(method == 'get') {
     const templateData = {
       'page.title': 'Log in',
       'page.description': 'Log into place your order.',
       'page.bodyClass': 'login',
       'page.bodyId': 'login',
     };

     // Read in a template as a string.
     helpers.getTemplate('login', templateData, (err, str) => {
       if(!err && str) {
          // Add the universal header and footer.
          helpers.addUniversalTemplate(str, templateData, (err, str) => {
            if(!err && str) callback(200, str, 'html');
            else callback(500, undefined, 'html');
          });
       } else callback(500, undefined, 'html');
     });
  } else callback(405, undefined, 'html');
};

/** Account settings page handler.
 * @param {data} object - request data
 * @param {data.method} string - request method
 */
handlers.settings = (data, callback) => {
  const { method } = data;

  // Reject any request that isn't a GET.
  if(method == 'get') {
     const templateData = {
       'page.title': 'Account Settings',
       'page.description': 'Change your account details.',
       'page.bodyId': 'accountSettings',
       'page.bodyClass': 'accountSettings',
     };

     // Read in a template as a string.
     helpers.getTemplate('settings', templateData, (err, str) => {
       if(!err && str) {
          // Add the universal header and footer.
          helpers.addUniversalTemplate(str, templateData, (err, str) => {
            if(!err && str) callback(200, str, 'html');
            else callback(500, undefined, 'html');
          });
       } else callback(500, undefined, 'html');
     });
  } else callback(405, undefined, 'html');
};

/** Account deleted page handler.
 * @param {data} object - request data
 * @param {data.method} string - request method
 */
handlers.accountDeleted = (data, callback) => {
  const { method } = data;

  // Reject any request that isn't a GET.
  if(method == 'get') {
     // Prepare data for interpolation @TODO add contents.
     const templateData = {
       'page.title': 'Account deleted',
       'page.description': 'Account delete confirmation.',
       'page.bodyId': 'accountDeleted',
       'page.bodyClass': 'accountDeleted',
     };

     // Read in a template as a string.
     helpers.getTemplate('account-deleted', templateData, (err, str) => {
       if(!err && str) {
          // Add the universal header and footer.
          helpers.addUniversalTemplate(str, templateData, (err, str) => {
            if(!err && str) callback(200, str, 'html');
            else callback(500, undefined, 'html');
          });
       } else callback(500, undefined, 'html');
     });
  } else callback(405, undefined, 'html');
};

/**
 * Get favicon.
 * @param {data} object request data
 * @param {data.method} string - request method
 */
handlers.favicon = (data, callback) => {
  const { method } = data;

  // Reject any request that isn't a GET
  if(data.method == 'get'){
    // Read in the favicon's data.
    helpers.getStaticAsset('favicon.ico', (err,data) => {
      if(!err && data) {
        // Callback the data.
        callback(200, data, 'favicon');
      } else callback(500);
    });
  } else callback(405);
};

/**
 * Get static assets.
 * @param {data} object request data
 * @param {data.method} string - request method
 * @param {data.trimmedPath} string - request path
 */
handlers.public = (data, callback) => {
  let { method, trimmedPath } = data;

  // Reject any request that isn't a GET.
  if(method == 'get') {
    // Get the filename being requested.
    const trimmedAssetName = trimmedPath.replace('public/','').trim();

    if(trimmedAssetName.length > 0) {
      // Read in the asset's data.
      helpers.getStaticAsset(trimmedAssetName, (err, data) => {
        if(!err && data) {
          // Determine the content type (default to plain text).
          let contentType = 'plain';

          if(trimmedAssetName.indexOf('.css') > -1) contentType = 'css';
          if(trimmedAssetName.indexOf('.png') > -1) contentType = 'png';
          if(trimmedAssetName.indexOf('.jpg') > -1) contentType = 'jpg';
          if(trimmedAssetName.indexOf('.ico') > -1) contentType = 'favicon';

           callback(200, data, contentType);
        } else callback(404);
      });
    } else callback(404);
  } else callback(405);
};

module.exports = handlers;
