/**
 * @module lib/handlers
 * Router handler functions.
 */

/** Module dependencies */
const _data = require('./data');
const helpers = require('./helpers');

 /** Instantiate the handlers module object */
const handlers = {};

/**
 * Handler for users route.
 * @param {data} object -  request data
 * @param {data.method} string - request method
 * @param {data.trimmedPath} string - route path
 * @param {data.headers} object - request headers object
 * @param {data.queryStringObject} object - request url query string object
 * @param {data.payload} object - request body payload
 */
handlers.users = (data, callback) => {
  const acceptableMethods = ['post', 'put', 'get', 'delete'];
  const { method } = data;
  if(acceptableMethods.indexOf(method) > -1) handlers._users[method](data, callback);
  else callback(405);
};

/** users request serving object */
handlers._users = {};

/**
 * Create a new user.
 * @param {data} object - request data
 * @param {data.payload} object - request body payload
 * @param {data.payload.firstName} string - user's first name, required
 * @param {data.payload.lastName} string - user's last name, required
 * @param {data.payload.email} string - user's email, required
 * @param {data.payload.address} string - user's address, required
 * @param {data.payload.city} string - user's city, required
 * @param {data.payload.state} string - user's state/province, required
 * @param {data.payload.postalCode} string - user's postal code, required
 * @param {data.payload.password} string - user's password, required
 */
handlers._users.post = (data, callback) => {
  let { firstName, lastName, email, address, city, state, postalCode, password } = data.payload;

  firstName = typeof(firstName) == 'string' && firstName.trim().length > 0 ? firstName.trim(): false;
  lastName = typeof(lastName) == 'string' && lastName.trim().length > 0 ? lastName.trim(): false;
  email = typeof(email) == 'string' &&  email.trim().length > 0 && helpers.validateEmailAddress(email) ? email.trim(): false;
  address = typeof(address) == 'string' &&  address.trim().length > 0 ? address.trim(): false;
  city = typeof(city) == 'string' &&  city.trim().length > 0 ? city.trim(): false;
  state = typeof(state) == 'string' &&  state.trim().length > 0 ? state.trim(): false;
  postalCode = typeof(postalCode) == 'string' &&  postalCode.trim().length > 0 ? postalCode.trim(): false;
  password = typeof(password) == 'string' &&  password.trim().length > 0 ? password.trim(): false;

  if(firstName && lastName && email && address && city && state && postalCode && password) {
      // Check for existing user.
      _data.read('users', email, (err, data) => {
        if(err) {
            const hashPassword = helpers.hash(password);
            if(hashPassword) {
              const userObj = {
                firstName,
                lastName,
                email,
                address,
                city,
                state,
                postalCode,
                hashPassword
              };

              // Create new user.
              _data.create('users', email, userObj, (err, data) => {
                if(!err) callback(200);
                else callback(500, {'Error': 'Could not create a new user.'});
              });

          } else callback(500, {'Error': 'Could not hash user\'s password.'});
        } else callback(400, {'Error': 'A user with given email address already exists.'});
      });
  } else callback(400,  {'Error': 'Missing required fields or fields are invalid.'});
};

/**
 * Update a user.
 * @param {data} object - request data
 * @param {data.headers} object - request headers
 * @param {data.headers.token} string - token, required
 * @param {data.payload} object request body payload
 * @param {data.payload.firstName} string - user's first name, optional
 * @param {data.payload.lastName} string - user's last name, optional
 * @param {data.payload.email} string - user's email, required
 * @param {data.payload.address} string - user's address, optional
 * @param {data.payload.city} string - user's city, optional
 * @param {data.payload.state} string - user's state/province, optional
 * @param {data.payload.postalCode} string - user's postal code, optional
 * @param {data.payload.password} string - user's password, optional
 */
handlers._users.put = (data, callback) => {
  let { firstName, lastName, email, address, city, state, postalCode, password } = data.payload;

  firstName = typeof(firstName) == 'string' && firstName.trim().length > 0 ? firstName.trim(): false;
  lastName = typeof(lastName) == 'string' && lastName.trim().length > 0 ? lastName.trim(): false;
  email = typeof(email) == 'string' &&  email.trim().length > 0 && helpers.validateEmailAddress(email) ? email.trim(): false;
  address = typeof(address) == 'string' &&  address.trim().length > 0 ? address.trim(): false;
  city = typeof(city) == 'string' &&  city.trim().length > 0 ? city.trim(): false;
  state = typeof(state) == 'string' &&  state.trim().length > 0 ? state.trim(): false;
  postalCode = typeof(postalCode) == 'string' &&  postalCode.trim().length > 0 ? postalCode.trim(): false;
  password = typeof(password) == 'string' &&  password.trim().length > 0 ? password.trim(): false;

  if(email) {
    if(firstName || lastName || address || city || state || postalCode || password) {
      // Get the token from headers.
      let { token } = data.headers;
      token = typeof(token) == 'string' ? token : false;

      // Validate the token.
      handlers._tokens.verifyToken(token, email, (isValidToken) => {
        if(isValidToken) {
          // Check for existing users.
          _data.read('users', email, (err, userData) => {
            if(!err && userData) {
              // Update the fields necessary.
              if(firstName) userData.firstName = firstName;
              if(lastName) userData.lastName = lastName;
              if(address) userData.address = address;
              if(city) userData.city = city;
              if(state) userData.state = state;
              if(postalCode) userData.postalCode = postalCode;
              if(password) userData.hashPassword = helpers.hash(password);

                   // Update user.
                  _data.update('users', email, userData, (err, data) => {
                    if(!err) callback(200);
                    else callback(500, {'Error': 'Could not update the user.'});
                  });
            } else callback(400, {'Error': 'The specified user does not exist. So could not update the user.'});
          });
        } else callback(403, {'Error': 'Missing required token in header or token is invalid.'});
      });
    } else callback(400,  {'Error': 'Missing field/s to update.'});
  } else callback(400,  {'Error': 'Missing required field or field is invalid.'});
};

 /**
  * Retrieve a user by given email.
  * @param {data} object - request data
  * @param {data.headers} object - request headers
  * @param {data.headers.token} string - token, required
  * @param {data.queryStringObject} object - request url query string object
  * @param {data.queryStringObject.email} string - user's email, required
  */
handlers._users.get = (data, callback) => {
  let {email} = data.queryStringObject;
  email = typeof(email) == 'string' &&  email.trim().length && helpers.validateEmailAddress(email) > 0 ? email.trim(): false;

  if(email) {
    // Get the token from headers.
    let { token } = data.headers;
    token = typeof(token) == 'string' ? token : false;

    // Validate the token.
    handlers._tokens.verifyToken(token, email, (isValidToken) => {
      if(isValidToken) {
          // Lookup for user who matches that email and return user data.
        _data.read('users', email, (err, userData) => {
          if(!err && userData) {
            delete userData.hashPassword;
            callback(200, userData);
          } else callback(400, {'Error': 'The specified user does not exist.'});
        });
      } else callback(403, {'Error': 'Missing required token in header or token is invalid.'});
    });
  } else callback(400,  {'Error': 'Missing required field or field is invalid.'});
};

 /**
  * Delete a user.
  * @param {data} object - request data
  * @param {data.headers} object - request headers
  * @param {data.headers.token} string - token, required
  * @param {data.queryStringObject} object - request url query string object
  * @param {data.queryStringObject.email} string - user's email, required
  */
handlers._users.delete = (data, callback) => {
  let { email } = data.queryStringObject;
  email = typeof(email) == 'string' &&  email.trim().length > 0 && helpers.validateEmailAddress(email) ? email.trim(): false;

  if(email) {
    // Get the token from headers.
    let { token } = data.headers;
    token = typeof(token) == 'string' ? token : false;

    // Validate the token.
    handlers._tokens.verifyToken(token, email, (isValidToken) => {
      if(isValidToken) {
        // Lookup for user who matches that email.
        _data.read('users', email, (err, userData) => {
          if(!err && userData) {
            // Delete the user.
            _data.delete('users', email, (err) => {
              if(!err) {
                let { cartId, orders } = userData;
                orders = typeof(orders) == 'object' && orders instanceof Array ? orders : [];
                cartId = typeof(cartId) == 'string' ? cartId : false;
                const ordersToDelete = orders.length;

                let cartDeletionError = false;
                let allOrderDeletionError = false;

                // Delete all user's orders (if any).
                if(ordersToDelete > 0) {
                  let ordersDeleted = 0;
                  let orderDeletionErrors = false;

                  for(const orderId of orders) {
                    _data.delete('orders', orderId, (err) => {
                        if(err) orderDeletionErrors = true;

                        ordersDeleted++;
                    });
                  }

                  // All orders not deleted.
                  if(ordersToDelete == ordersDeleted && orderDeletionErrors) {
                      allOrderDeletionError = true;
                  }
                }

                // Delete user's cart (if any).
                if(cartId) {
                  _data.delete('carts', cartId, (err) => {
                    if(err) cartDeletionError = true;
                  });
                }

                if(cartDeletionError && !allOrderDeletionError) callback(500, {'Error': 'Errors encountered while attempting to delete user\'s active cart. Active cart may not have been deleted from the system successfully.'});
                else if(!cartDeletionError && allOrderDeletionError) callback(500, {'Error': 'Errors encountered while attempting to delete all of the user\'s orders. All orders may not have been deleted from the system successfully.'});
                else callback(200);

              } else callback(500, {'Error': 'Could not delete the specified user.'})
            });
          } else callback(400, {'Error': 'The specified user does not exist. So could not delete the user.'});
        });
      } else callback(403, {'Error': 'Missing required token in header or token is invalid.'});
    });
  } else callback(400,  {'Error': 'Missing required field or field is invalid.'});
};

/**
 * Handler for tokens route.
 * @param {data} object -  request data
 * @param {data.method} string - request method
 * @param {data.trimmedPath} string - route path
 * @param {data.headers} object - request headers object
 * @param {data.queryStringObject} object - request url query string object
 * @param {data.payload} object - request body payload
 */
handlers.tokens = (data, callback) => {
  const acceptableMethods = ['post', 'put', 'get', 'delete'];
  const { method } = data;
  if(acceptableMethods.indexOf(method) > -1) handlers._tokens[method](data, callback);
  else callback(405);
};

/** Tokens request serving object */
handlers._tokens = {};

/**
 * Create a token.
 * @param {data} object -  request data
 * @param {data.payload} object - request body payload
 * @param {data.payload.email} string - user's email, required
 * @param {data.payload.password} string - user's password, required
 */
handlers._tokens.post = (data, callback) => {
  let { email, password } = data.payload;

  email = typeof(email) == 'string' &&  email.trim().length > 0 && helpers.validateEmailAddress(email) ? email.trim(): false;
  password = typeof(password) == 'string' &&  password.trim().length > 0 ? password.trim(): false;

  if(email && password) {
    // Lookup for user who matches that email.
    _data.read('users', email, (err, userData) => {
      if(!err && userData) {
          const hashPassword = helpers.hash(password);

          if(userData.hashPassword === hashPassword) {
            // 20 chars long string.
            const id = helpers.generateRandomString(20);
            // Set expiration after one hour from current time.
            const expires = Date.now() * 1000 * 60 * 60;

            const tokenObj = {
              id,
              email,
              expires
            };

            _data.create('tokens', id, tokenObj, (err) => {
              if(!err) callback(200, tokenObj);
              else callback(500, {'Error': 'Could not create the new token.'})
            });
          } else callback(400, {'Error': 'Password did not match the specified user\'s stored password.'});
      } else callback(400, {'Error': 'The specified user does not exist.'});
    });
  } else callback(400, {'Error': 'Missing required fields.'});
};

/**
 * Retrieve a token.
 * @param {data} object -  request data
 * @param {data.queryStringObject} object - request url query string object
 * @param {data.queryStringObject.id} string - token id, required
 */
handlers._tokens.get = (data, callback) => {
    let { id } = data.queryStringObject;
    id = typeof(id) == 'string' && id.trim().length === 20 ? id.trim(): false;

    if(id) {
        _data.read('tokens', id, (err, tokenData) => {
            if(!err && tokenData) callback(200, tokenData);
            else callback(400, {'Error': 'The specified token does not exist.'});
        });
    } else callback(400, {'Error': 'Missing required field or field is invalid.'})
};

/** Update token expiration time.
 * @param {data} object -  request data
 * @param {data.payload} object - request url query string object
 * @param {data.payload.id} string - token id, required
 * @param {data.payload.extend} boolean - extend token expiration time, required
 */
handlers._tokens.put = (data, callback) => {
  let {id, extend } = data.payload;
  id = typeof(id) == 'string' && id.trim().length == 20 ? id.trim(): false;
  extend = typeof(extend) == 'boolean' && extend == true ? true : false;

  if(id && extend) {
    _data.read('tokens', id, (err, tokenData) => {
      if(!err && tokenData) {
        // Token should not be expired to extend the expiration time.
        if(tokenData.expires > Date.now()) {
          _data.update('tokens', id, tokenData, (err) => {
            if(!err) callback(200);
            else callback(500, {'Error': 'Could not update the token\'s expiration.'});
          });
        } else Callback(400, {'Error': 'The token has already expired, and cannot be extended.'});
      } else callback(400, {'Error': 'The specified token does not exist. So could not update the token\'s expiration.'});
    });
  } else callback(400, {'Error': 'Missing required fields or fields are invalid.'});
};

/**
 * Delete a token.
 * @param {data} object -  request data
 * @param {data.queryStringObject} object - request url query string object
 * @param {data.queryStringObject.id} string - token id, required
 */
handlers._tokens.delete = (data, callback) => {
  let { id } = data.queryStringObject;
  id = typeof(id) == 'string' && id.trim().length === 20 ? id.trim() : false;

  if(id) {
    // Lookup for the token which matches the given id.
    _data.read('tokens', id, (err, tokenData) => {
      if(!err && tokenData) {
          _data.delete('tokens', id, (err) => {
            if(!err) callback(200);
            else callback(500, {'Error': 'Could not delete the specified token.'});
          });
      } else callback(400, {'Error': 'The specified token does not exist.'});
    })
  } else callback(400, {'Error': 'Missing required field or field is invalid.'});
};

/**
 * Verify if a given token id is currently valid for a given user.
 * @param {id} string - token id, required
 * @param {email} string - user's email, required
 */
handlers._tokens.verifyToken = (id, email, callback) => {
  // Lookup for the token which matches the given id.
  _data.read('tokens', id, (err, tokenData) => {
    if(!err && tokenData) {
        if(tokenData.email == email && tokenData.expires > Date.now()) callback(true);
        else callback(false);
    } else callback(false);
 });
};

/** Handler for menu route.
 * @param {data} object -  request data
 * @param {data.method} string - request method
 * @param {data.trimmedPath} string - route path
 * @param {data.headers} object - request headers object
 * @param {data.queryStringObject} object request url query string object
 * @param {data.payload} object request body payload
 */
handlers.menu = (data, callback) => {
    const acceptableMethods = ['get'];
    const { method } = data;
    if(acceptableMethods.indexOf(method) > -1) handlers._menu[method](data, callback);
    else callback(405);
};

/** Menu request serving object */
handlers._menu = {};

/**
 * Retrieve menu.
 * @param {data} object -  request data
 */
handlers._menu.get = (data, callback) => {
  _data.read('menu', 'pizza', (err, menuData) => {
    if(!err && menuData) callback(200, menuData);
    else callback(400, {'Error': 'Could not find pizza menu items.'});
  });
};

/** Handler for items route.
 * @param {data} object -  request data
 * @param {data.method} string - request method
 * @param {data.trimmedPath} string - route path
 * @param {data.headers} object - request headers object
 * @param {data.queryStringObject} object request url query string object
 * @param {data.payload} object request body payload
 */
handlers.items = (data, callback) => {
    const acceptableMethods = ['get'];
    const { method } = data;
    if(acceptableMethods.indexOf(method) > -1) handlers._items[method](data, callback);
    else callback(405);
};

/** Items request serving object */
handlers._items = {};

/**
 * Retrieve an item.
 * @param {data} object - request data
 * @param {data.queryStringObject} object - request url query string object
 * @param {data.queryStringObject.id} string - item id, required
 */
handlers._items.get = (data, callback) => {
  let { id } = data.queryStringObject;
  id = typeof(id) == 'string' && id.trim().length == 4 ? id.trim() : false;

  if(id) {
    _data.read('menu', 'pizza', (err, menuData) => {
      if(!err && menuData) {
          const item = menuData.filter(item => item.id == id);
          if(item.length == 1) {
              const itemData = item[0];
              callback(200, itemData);
          } else callback(400, {'Error': 'Could not find the specified item.'})
      } else callback(400, {'Error': 'Could not find the menu items.'});
    });
  } else callback(400, {'Error': 'Missing required field or invalid field.'});
};

/** Handler for carts route.
 * @param {data} object -  request data
 * @param {data.method} string - request method
 * @param {data.trimmedPath} string - route path
 * @param {data.headers} object - request headers object
 * @param {data.queryStringObject} object request url query string object
 * @param {data.payload} object request body payload
 */
handlers.carts = (data, callback) => {
  const acceptableMethods = ['post', 'put', 'get'];
  const { method } = data;
  if(acceptableMethods.indexOf(method) > -1) handlers._carts[method](data, callback);
  else callback(405);
};

/** Carts request serving object */
handlers._carts = {};

/**
 * Create a shopping cart.
 * @param {data} object -  request data
 * @param {data.headers} object - request headers
 * @param {data.headers.token} string - token, required
 * @param {data.payload} object - request body payload
 * @param {data.payload.items} array - array of item object, required
 */
handlers._carts.post = (data, callback) => {
  let { items } = data.payload;
  items = typeof(items) == 'object' && items instanceof Array ? items : [];
  const len = items.length;

  let { token } = data.headers;
  token = typeof(token) == 'string' ? token : false;

  if(len > 0) {
    // Lookup for the token which matches the given id.
    _data.read('tokens', token, (err, tokenData) => {
        if(!err && tokenData) {
            const { email } = tokenData;

            // Validate the token.
            handlers._tokens.verifyToken(token, email, (isValidToken) => {
                if(isValidToken) {
                  _data.read('users', email, (err, userData) => {
                    if(!err && userData) {

                    const cartId = helpers.generateRandomString(20);
                    const total = items.reduce((accumulator, {price, qty}) => ((price * qty) + accumulator), 0);
                    const cartObj = {
                      'id':cartId,
                      email,
                      items,
                      total
                    };
                       // Create a new cart.
                      _data.create('carts', cartId, cartObj, (err) => {
                        if(!err) {
                          userData.cartId = cartId;
                          // update user active cart.
                          _data.update('users', email, userData, (err) => {
                            if(!err) callback(200);
                            else callback(500, {'Error': 'Could not update the user with the new cart id.'});
                          });
                        } else callback(500, {'Error': 'Could not create the cart.'});
                      });
                    } else callback(400, {'Error': 'Could not find the specified user.'});
                  });
                } else callback(403, {'Error': 'Missing required token in header or token is invalid.'});
            });
        } else callback(400, {'Error': 'Could not find the specified token.'});
    });
  } else callback(400, {'Error': 'Missing required fields, or fields are invalid.'});
};

/**
 * Retrieve a shopping cart.
 * @param {data} object -  request data
 * @param {data.headers} object - request headers
 * @param {data.headers.token} string - token, required
 * @param {data.queryStringObject} object - request url query string object
 * @param {data.queryStringObject.id} string - cart id, required
 */
handlers._carts.get = (data, callback) => {
  let { id } = data.queryStringObject;
  id = typeof(id) == 'string' && id.trim().length == 20 ? id.trim(): false;

  if(id) {
    // Lookup for the cart which matches the given id.
    _data.read('carts', id, (err, cartData) => {
        if(!err && cartData) {
          const {email} = cartData;

          let { token } = data.headers;
          token = typeof(token) == 'string' ? token : false;
          // Validate the token.
          handlers._tokens.verifyToken(token, email, (isValidToken) => {
            if(isValidToken)  callback(200, cartData);
            else callback(403, {'Error': 'Missing required token in header or token is invalid.'});
          });
        } else callback(400, {'Error': 'Could not find the specified cart.'});
    });
  } else callback(400, {'Error': 'Missing required inputs, or inputs are invalid.'})
};

/**
 * Update the shopping cart.
 * @param {data} object -  request data
 * @param {data.headers} object - request headers
 * @param {data.headers.token} string - token, required
 * @param {data.payload} object - request body payload
 * @param {data.payload.id} string - cart id, required
 * @param {data.payload.items} array - array of item object, required
 */
handlers._carts.put = (data, callback) => {
  let { id, items } = data.payload;
  id = typeof(id) == 'string' && id.trim().length == 20 ? id.trim() : false;
  items = typeof(items) == 'object' && items instanceof Array ? items : [];
  const len = items.length;

  if(id) {
      // Lookup for the cart which matches the given id.
      _data.read('carts', id, (err, cartData) => {
        if(!err && cartData) {
          const { email } = cartData;

          let { token } = data.headers;
          token = typeof(token) == 'string' ? token : false;
          // Validate the token.
          handlers._tokens.verifyToken(token, email, (isValidToken) => {
            if(isValidToken) {
                cartData.items = items;
                cartData.total = items.reduce((accumulator, {price, qty}) => ((price * qty) + accumulator), 0);
              // Update the cart.
              _data.update('carts', id, cartData, (err) => {
                if(!err) callback(200);
                else callback(500, {'Error' : 'Could not update the cart.'});
              });
            } else callback(403, {'Error': 'Missing required token in header or token is invalid.'});
          });
        } else callback(400, {'Error' : 'The specified cart does not exist.'});
      });
  } else callback(400, {'Error': 'Missing required inputs, or inputs are invalid.'});
};

/**
 * Handler for orders route.
 * @param {data} object -  request data
 * @param {data.method} string - request method
 * @param {data.trimmedPath} string - route path
 * @param {data.headers} object - request headers object
 * @param {data.queryStringObject} object request url query string object
 * @param {data.payload} object request body payload
 */
handlers.orders = (data, callback) => {
  const acceptableMethods = ['post', 'get'];
  const { method } = data;
  if(acceptableMethods.indexOf(method) > -1) handlers._orders[method](data, callback);
  else callback(405);
};

/** Orders request serving object */
handlers._orders = {};

/**
 * Create a new order.
 * @param {data} object -  request data
 * @param {data.headers} object - request headers
 * @param {data.headers.token} string - token, required
 * @param {data.payload} object - request body payload
 * @param {data.payload.cartId} string - cart id, required
 * @param {data.payload.cardName} string - card holder's name, required
 * @param {data.payload.cardNumber} string - card number, required
 * @param {data.payload.cardCvc} string - card cvc (three or four digits number), required
 * @param {data.payload.cardExpireMonth} number - card expiration month, required
 * @param {data.payload.cardExpireYear} number - card expiration year, required
 */
handlers._orders.post = (data, callback) => {
  let { cartId, cardName, cardNumber, cardCvc, cardExpireMonth, cardExpireYear } = data.payload;

  cartId = typeof(cartId) == 'string' && cartId.trim().length == 20 ? cartId.trim() : false;
  cardName = typeof(cardName) == 'string' && cardName.trim().length > 0 ? cardName.trim() : false;
  cardNumber = typeof(cardNumber) == 'string' && cardNumber.trim().length == 16 ? cardNumber.trim() : false;
  cardCvc = typeof(cardCvc) == 'string' && (/^[0-9]{3,4}$/).test(cardCvc) ? cardCvc : false;
  cardExpireMonth = typeof(cardExpireMonth) == 'number' && cardExpireMonth > 0 && cardExpireMonth <= 12 ? cardExpireMonth : false;
  cardExpireYear = typeof(cardExpireYear) == 'number' && (/^\d{2}|\d{4}$/).test(cardExpireYear) ? cardExpireYear : false;

  if(cartId && cardName && cardNumber && cardCvc && cardExpireMonth && cardExpireYear) {
    // Lookup for the cart which matches the given id.
    _data.read('carts', cartId, (err, cartData) => {
      if(!err && cartData) {
          const { email, total, items } = cartData;

          let { token } = data.headers;
          token = typeof(token) == 'string' ? token : false;
          // Validate the token.
          handlers._tokens.verifyToken(token, email, (isValidToken) => {
             if(isValidToken) {
               const orderId = helpers.generateRandomString(20);
               /**
                * receipt has three states. [pending, sent, failed]
                * payment has three states. [pending, succeeded, failed]
                */
               const orderObj = {
                 'id':orderId,
                 email,
                 cartId,
                 'receipt': 'pending',
                 'payment': 'pending'
               };
               // Create a new order.
               _data.create('orders', orderId, orderObj, (err) => {
                 if(!err) {
                   // Update user order.
                   _data.read('users', email, (err, userData) => {
                     if(!err && userData) {
                        let { firstName, lastName, orders } = userData;
                        orders = typeof(orders) == 'object' && orders instanceof Array ? orders : [];
                        orders.push(orderId);
                        userData.orders = orders;
                        userData.cartId = false; // User order created, so there is no active carts.

                        _data.update('users', email, userData, (err) => {
                            if(!err) {
                              // Pay for the order.
                              helpers.sendPayment(email, cardName, cardNumber, cardCvc, cardExpireMonth, cardExpireYear, total, (error, paymentData) => {
                                 if(!error && paymentData) {
                                   const { id } = paymentData;

                                   _data.read('orders', orderId, (err, orderData) => {
                                      if(!err && orderData) {
                                         // Update order with payment status to succeeded and stripe charge id.
                                          orderData.payment = 'succeeded';
                                          orderData.chargeId = id;

                                          _data.update('orders', orderId, orderData, (err) => {
                                            if(!err) {
                                              // Email the receipt.
                                              helpers.sendEmail(email, orderId, firstName, lastName, total, items, (err, data) => {
                                               if(!err) {
                                                    const { id } = data;
                                                    orderData.receipt = 'sent';
                                                    orderData.deliveredId = id;

                                                    // Update order with receipt to sent and email delivery id.
                                                    _data.update('orders', orderId, orderData, (err) => {
                                                        if(!err) callback(200);
                                                        else callback(500, {'Error': 'Could not update the specified order with receipt details.'});
                                                    });
                                              } else {
                                                // Update order with receipt to failed and log the record.
                                                orderData.receipt = 'failed';
                                                // Update order with receipt to sent and email delivery id.
                                                _data.update('orders', orderId, orderData, (err) => {
                                                    if(!err) callback(500, {'Error': 'Email service failed to send the order receipt.'});
                                                    else callback(500, {'Error': 'Could not update the specified order with receipt details.'});
                                                });
                                              }
                                            });
                                            } else callback(500, {'Error': 'Could not update the specified order with payment details.'});
                                          });
                                      } else callback(400, {'Error': 'Could not find the specified order.'});
                                   });
                                 } else {
                                   // Update order with payment status to failed and log the record.
                                   _data.read('orders', orderId, (err, orderData) => {
                                     if(!err && orderData) {
                                       orderData.payment = 'failed';

                                       _data.update('orders', orderId, orderData, (err) => {
                                         if(!err) callback(500, {'Error': 'Payment service could not charge the card.'});
                                         else callback(500, {'Error': 'Could not update the specified order with payment details.'});
                                       });
                                     } else callback(400, {'Error': 'Could not find the specified order.'});
                                   });
                                 }
                             });
                            } else callback(500, {'Error': 'Could not update the user\'s orders.'});
                        });
                     } else callback(400, {'Error': 'Could not find the user who created the order.'});
                   });
                 } else callback(500, {'Error': 'Could not create the new order.'});
               });
             } else callback(403, {'Error': 'Missing required token in header or token is invalid.'});
          });
      } else callback(400, {'Error': 'Could not find the specified cart.'});
    });
  } else callback(400, {'Error': 'Missing required inputs.'});
};

/**
 * Retrieve an order.
 * @param {data} object -  request data
 * @param {data.headers} object - request headers
 * @param {data.headers.token} string - token, required
 * @param {data.queryStringObject} object - request url query string object
 * @param {data.queryStringObject.id} string - order id, required
 */
handlers._orders.get = (data, callback) => {
  let { id } = data.queryStringObject;
  id = typeof(id) == 'string' && id.trim().length == 20 ? id.trim(): false;

  if(id) {
    _data.read('orders', id, (err, orderData) => {
        if(!err && orderData) {
          const {email} = orderData;

          let { token } = data.headers;
          token = typeof(token) == 'string' ? token : false;
          // Validate the token.
          handlers._tokens.verifyToken(token, email, (isValidToken) => {
            if(isValidToken)  callback(200, orderData);
            else callback(403);
          });
        } else callback(404);
    });
  } else callback(400, {'Error': 'Missing required inputs'});
};

handlers.notFound = (data, callback) => callback(404);

handlers.ping = (data, callback) => callback(200);

module.exports = handlers;
