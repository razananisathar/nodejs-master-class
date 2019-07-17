/**
 * @module Front-end app
 */
 const localStorage = window.localStorage;
 const app = {};

/** Instatiate app object */
 app.config = {
   'sessionToken' : false,
   'sessionCart': false
 };

/** Interface for calling RESTful API */
 app.client = {};

/** Interface for API calls.
 * @param {path} string - request path
 * @param {method} string - request method
 * @param {queryStringObject} object - request query parameters
 * @param {payload} object - request body payload
 */
app.client.request = (path, method, queryStringObject, payload, callback) => {
  path = typeof(path) == 'string' ? path : '/';
  method = typeof(method) == 'string' && ['POST','GET','PUT','DELETE'].indexOf(method.toUpperCase()) > -1 ? method.toUpperCase() : 'GET';
  queryStringObject = typeof(queryStringObject) == 'object' && queryStringObject !== null ? queryStringObject : {};
  payload = typeof(payload) == 'object' && payload !== null ? payload : {};

  path = path.indexOf(window.location.origin) > -1 ? path : `${window.location.origin}${path}`;

  // Construct request url.
  const requestUrl = new URL(path);

  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if(app.config.sessionToken) {
    options.headers.token = app.config.sessionToken.id;
  }

  // Add query params.
  if(method == 'GET' || method == 'DELETE') {
    Object.keys(queryStringObject).forEach(key => requestUrl.searchParams.append(key, queryStringObject[key]));
  }

  // Add body payload.
  if(method == 'POST' || method == 'PUT') {
    options.body =  JSON.stringify(payload);
  }

  fetch(requestUrl, options)
    .then(res => res.json().then(data => callback(res.status, data)))
    .catch(error => console.error('Error:', error));
};

/**
 * Load items data on menu page.
 * @param {bodyId} string - id of the body tag
 */
app.loadMenuData = (bodyId) => {
  let elMenuDiv = document.getElementById('items');

  app.client.request('/api/menu', 'GET', undefined, undefined, (statusCode, responsePayload) => {
    if(statusCode == 200 && responsePayload instanceof Array && responsePayload.length > 0) {
      let count = 0;

      for(const { id, name, description, vegetarian, image } of responsePayload) {
         let elItemSection = `<section class="item" data-item-id="item${id}">
                              <div class="featured-img">
                                <img src="public/images/${image}" alt="${name}" class="">
                                <img class="type-icon" src="public/images/${(vegetarian)? 'veg-icon' : 'non-veg-icon'}.jpg" alt="${(vegetarian)? 'veg' : 'non-veg'}">
                              </div>
                              <h3>${name}</h3>
                              <p>${description.substr(0, description.indexOf('.'))}.</p>
                              <div class="item-order">
                                <a href="menu/item?id=${id}&name=${name}" class="btn btn-order" id="btnOrder${id}">Order Now</a>
                              </div>
                              </section>`;

          count++;
          elMenuDiv.insertAdjacentHTML('afterbegin', elItemSection);

          // Load index page items.
          if(bodyId == 'index' && count == 3) break;
      }
    } else {
        elMenuDiv.classList.add('hide');
        document.getElementById('noItems').classList.remove('hide');
    }
  });
};

/**
 * Load item data on item page.
 */
app.loadItemData = () => {
  let elItemDiv = document.getElementById('itemInfo');

  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');
  const queryStringObject = { 'id': id };

  app.client.request('/api/items', 'GET', queryStringObject, undefined, (statusCode, response) => {
      if(statusCode == 200) {
          const { id, name, description, vegetarian, image, prices } = response;

          const elPanSelect = document.createElement('select');
          elPanSelect.setAttribute('id', 'selectPanType');
          elPanSelect.setAttribute('name', 'pan');

          for(const key in prices) {
            const { pan, price } = prices[key];
            const panOptions = `<option value="${pan}" data-pan="${pan}" data-price="${price.toFixed(2)}" selected="${pan == 'small'}">${pan.charAt(0).toUpperCase()+ pan.slice(1)}</option>`;
            elPanSelect.insertAdjacentHTML('afterbegin', panOptions);
          }

          const elItemSection = `<div class="column-2">
                                    <img src="public/images/${image}" alt="${name}" class="pull-right">
                                 </div>
                                 <div class="column-2">
                                    <h2 class="headline m-0">${name}</h2>
                                    <p>${description}</p>
                                    <p><b>Type:</b> ${(vegetarian) ? 'Veg': 'Non-Veg'}</p>
                                    <p class="price item-desc">$ ${elPanSelect.options[elPanSelect.options.selectedIndex].dataset.price}</p>
                                    <div class="form-row item-desc select-pan">
                                    </div>
                                    <div class="form-row item-desc">
                                      <input type="number" name="qty" min="1" max="10" value="1" placeholder="Qty">
                                      <p class="error"></p>
                                    </div>
                                    <div class="form-row item-desc">
                                      <input type="hidden" name="name" value="${name}">
                                      <button type="submit" class="btn mlr-20">Add to cart</button>
                                    </div>
                                    <br>
                                    <a href="/menu" class="btn btn-continue">Continue Shopping</a>
                                 </div>`;

          elItemDiv.insertAdjacentHTML('afterbegin', elItemSection);
          elItemDiv.querySelector('.select-pan').append(elPanSelect);

          const elErrorPara = document.createElement('p');
          elErrorPara.setAttribute('class', 'error');
          elItemDiv.querySelector('.select-pan').append(elErrorPara);
      } else {
        document.getElementById('noItem').classList.remove('hide');
        document.querySelector('form[name="frmCart"]').classList.add('hide');
      }
  });
};

/**
 * Load user account settings data on account page.
 * @param {bodyId} string - id of the body tag
 */
app.loadAccountData = (bodyId) => {
    let { email } = app.config.sessionToken;

    // Get the email from the current token, or log the user out if none is there.
    email = typeof(email) == 'string' ? email : false;
    if(email) {
      const queryStringObject = {
         email
      };


      app.client.request('/api/users', 'GET', queryStringObject, undefined, (statusCode, responsePayload) => {
        if(statusCode == 200) {

          const { firstName, lastName, email, address, city, state, postalCode } = responsePayload;
            // Bind data on edit account form.
            if(bodyId == 'accountSettings') {
            const formEdit = document.getElementById('frmAccEdit');
            const formChangePassword = document.getElementById('frmAccPassword');
            const formAccDelete = document.getElementById('frmAccDelete');

            formEdit.querySelector('input[name="firstName"]').value = firstName;
            formEdit.querySelector('input[name="lastName"]').value = lastName;
            formEdit.querySelector('input[name="email"]').value = email;
            formEdit.querySelector('input[name="address"]').value = address;
            formEdit.querySelector('input[name="city"]').value = city;
            formEdit.querySelector('input[name="state"]').value = state;
            formEdit.querySelector('input[name="postalCode"]').value = postalCode;

            formChangePassword.querySelector('input[name="email"]').value = email;
            formAccDelete.querySelector('input[name="email"]').value = email;

          } else if(bodyId == 'cart') {
            // Bind data on cart billing address form.
            const formBillingAddress = document.getElementById('billingAddress');

            formBillingAddress.querySelector('input[name="address"]').value = address;
            formBillingAddress.querySelector('input[name="city"]').value = city;
            formBillingAddress.querySelector('input[name="state"]').value = state;
            formBillingAddress.querySelector('input[name="postalCode"]').value = postalCode;
          }

        } else app.logUserOut();
      });

    } else app.logUserOut();
};

/**
 * Display all orders.
 */
app.loadOrdersData = () => {
  let { email } = app.config.sessionToken;

  // Get the email from the current token, or log the user out if none is there.
  email = typeof(email) == 'string' ? email : false;
  if(email) {
    const queryStringObject = {
       email
    };

    app.client.request('/api/users', 'GET', queryStringObject, undefined, (statusCode, response) => {
      if(statusCode == 200) {
        let { orders  } = response;

        orders = typeof(orders) == 'object' && orders instanceof Array ? orders : [];

        if(orders.length > 0 ) {
          const tbody = document.getElementById('tbodyOrders');

          orders.forEach(orderId => {
              const newQueryStringObject = {'id': orderId };

              app.client.request('/api/orders', 'GET', newQueryStringObject, undefined, (statusCode, responsePayload) => {
                let elRow;
                if(statusCode) {
                    const { id, receipt, chargeId, payment, deliveredId } = responsePayload;

                    elRow = `<tr>
                              <td>${id}</td>
                              <td>${payment}</td>
                              <td>${chargeId}</td>
                              <td>${(deliveredId) ? 'Sent': 'Not Sent'}</td>
                             </tr>`;
                } else {
                    elRow = `<tr class="order-error"><td colspan="4">Could not retrieve the specified order.</td></tr>`;
                }

                tbody.insertAdjacentHTML('afterbegin', elRow);
              });
          });
        } else {
          document.getElementById('tblOrders').classList.add('hide');
          document.getElementById('noOrders').classList.remove('hide');
        }
      } else app.logUserOut();
    });
  } else app.logUserOut();
};

/**
 * Load cart data on checkout page.
 */
 app.loadCartData = () => {
  if(app.config.sessionToken)  {
     if(app.config.sessionCart) {
       const {id, items, total } = app.config.sessionCart;

       const form = document.getElementById('frmOrder');
       form.querySelector('input[name="cartId"]').value = id;

       const tbody = document.getElementById('tbodyCart');

         if(items && items.length > 0 ) {
           for(const key in items) {
             const { name, pan, price, qty } = items[key];
             const row = `<tr>
                            <td>${name}</td>
                            <td>${pan}</td>
                            <td class="text-right">$ ${price}</td>
                            <td class="text-right">${qty}</td>
                            <td class="text-right">$ ${(price * qty).toFixed(2)}</td>
                            <td><a href="/" class="btn-delete" data-name="${name}" data-index="${key}">x</button></a>
                          </tr>`;
            tbody.insertAdjacentHTML('afterbegin', row);
           }

           const rowTotal = `<tr class="price">
                              <td colspan="4" class="text-right">Total</td>
                              <td colspan="2" class="text-right">$ ${total.toFixed(2)}</td>
                             </tr>`;

           tbody.insertAdjacentHTML('beforeend', rowTotal);

         } else {
           document.getElementById('noCart').classList.remove('hide');
           document.getElementById('checkout').classList.add('hide');
         }

     } else {
       document.getElementById('noCart').classList.remove('hide');
       document.getElementById('checkout').classList.add('hide');
     }

   } else {
     document.getElementById('checkout').classList.add('hide');
     const elErrorDiv =  document.getElementById('noCart');
     elErrorDiv.classList.remove('hide');
     const elPara = elErrorDiv.querySelector('.alert-warning');
     elPara.innerText = '';
     elPara.innerHTML = 'You are not logged in. <a href="/account/login">Log in</a> to place your order.';
   }
};

/**
 * Load data on the page.
 */
app.loadDataOnPage = () => {
  const bodyId = document.getElementsByTagName('body')[0].id;

  switch(bodyId) {
    case 'accountSettings':
      app.loadAccountData(bodyId);
      break;
    case 'index':
    case 'menu':
      app.loadMenuData(bodyId);
      break;
    case 'item':
      app.loadItemData();
      break;
    case 'cart':
      app.loadCartData();
      app.loadAccountData(bodyId);
      break;
    case 'allOrders':
      app.loadOrdersData();
      break;
  }
};

/**
 * Retrieve cart data.
 */
app.getCartData = () => {
   let { email } = app.config.sessionToken;

   // Get the email from the current token, or log the user out if none is there.
   email = typeof(email) == 'string' ? email : false;
   if(email) {
       const queryStringObject = {
          email
       };

       app.client.request('/api/users', 'GET', queryStringObject, undefined, (statusCode, responsePayload) => {
             if(statusCode == 200) {
               const { cartId } = responsePayload;

               if(cartId) {
                  // Get cart data.
                  const newQueryStringObject = { 'id': cartId };

                  app.client.request('/api/carts', 'GET', newQueryStringObject, undefined, (statusCode, responsePayload) => {
                    if(statusCode == 200) app.setSessionCart(responsePayload);
                    else app.setSessionCart(false);
                  });

               } else app.setSessionCart(false);

            } else app.logUserOut();
       });
   } else app.logUserOut();
 };


 /**
  * Get user data.
  * @param {email} string - user's email.
  */
 app.loadUser = () => {
  const { email } = app.config.sessionToken;

   if(email) {
     const queryStringObject = {
       email
     };

     app.client.request('/api/users', 'GET', queryStringObject, undefined, (statusCode, responsePayload) => {
       if(statusCode == 200) app.displayLoggedInUser(responsePayload);
       else app.displayLoggedInUser(false);
     });
   }
 };

/**
 * Display logged in user name on navbar.
 * @param {user} object - user's data
 */
app.displayLoggedInUser = (user) => {
  if(typeof user == 'object' && user.hasOwnProperty('firstName') && user.hasOwnProperty('lastName')) {
    const { firstName, lastName } = user;
    document.getElementById('user').innerHTML = `<b>Logged in as</b> ${firstName}&nbsp;${lastName}`;
  }
};

/**
 * Add items to cart or remove items.
 * @param {item} object - cart item object.
 */
app.addToCart = (item) => {
  if(app.config.sessionToken) {
    item = typeof(item) == 'object'? item : {};
    // Turn cart data to payload.
    let items = [];
    const payload = {};

    let method = '';
    if(app.config.sessionCart) {
      method = 'PUT';
      payload['id'] = app.config.sessionCart.id;
      items = app.config.sessionCart.items;
    }
    else method = 'POST';

    items.push(item);
    payload['items'] = items;

    app.client.request('/api/carts', method, undefined,  payload, (statusCode, responsePayload) => {
        if(statusCode == 200) {
            const queryStringObject = { 'email': app.config.sessionToken.email };

            app.client.request('/api/users', 'GET', queryStringObject, undefined, (statusCode, responsePayload) => {
              if(statusCode == 200) {
                  const { cartId } = responsePayload;

                  const newQueryStringObject = { 'id': cartId };

                  app.client.request('/api/carts', 'GET', newQueryStringObject, undefined, (statusCode, responsePayload) => {
                      if(statusCode == 200) app.setSessionCart(responsePayload);
                      else app.setSessionCart(false);
                  });
              } else app.logUserOut();
            });
       } else {
           document.getElementById('noItem').innerText(responsePayload.Error);
           document.getElementById('noItem').classList.remove('hide');
           document.getElementById('noItem').classList.add('alert-danger');
       }
    });
  } else {
      const elErrorPara = document.getElementById('noItem');
      elErrorPara.innerText ='';
      elErrorPara.innerHTML = 'You are not logged in. <a href="/account/login">Log in</a> to place your order.';
      const removeCls = ['hide', 'mlr-20'];
      const addCls = ['mlr-0'];
      elErrorPara.classList.remove(...removeCls);
      elErrorPara.classList.add(...addCls);
  }
};

/**
 * Remove items from cart on checkout page.
 */
 app.bindRemoveItemsEvent = () => {
   if(document.getElementsByTagName('body')[0].id == 'cart') {
   const cartDIV = document.getElementById('tbodyCart');
    cartDIV.addEventListener('click', (e) => {
      e.preventDefault();
      if(e.target && e.target.getAttribute('class') == 'btn-delete') {
        const {id, items } =  app.config.sessionCart;
        const index = e.target.dataset.index;

        items.splice(index, 1);

        const payload = {};
        payload['id'] = id;
        payload['items'] = items;

        const elErrorDiv = document.getElementById('noCart');
        const elPara = elErrorDiv.querySelector('.alert');

        app.client.request('/api/carts', 'PUT', undefined, payload, (statusCode, responsePayload) => {
          if(statusCode == 200) {

            const queryStringObject = {
              id
            };

            app.client.request('/api/carts', 'GET', queryStringObject, undefined, (statuCode, responsePayload) => {
              if(statusCode == 200) {
                if(elErrorDiv.getAttribute('class') !== 'hide') {
                  elErrorDiv.classList.add('hide');
                  document.getElementById('checkout').classList.remove('hide');
                }

                app.setSessionCart(responsePayload);
                const { items } = responsePayload;

                if(items.length == 0) {
                  elErrorDiv.classList.remove('hide');
                  elPara.classList.remove('alert-danger');
                  elPara.innerText = 'Your cart is empty.';
                  elPara.classList.add('alert-warning');

                  document.getElementById('checkout').classList.add('hide');
                }

                const tbody = document.getElementById('tbodyCart');

                while (tbody.firstChild) {
                  tbody.removeChild(tbody.firstChild);
                }
                app.loadCartData();
              }
            });

          } else {
            const { Error } = responsePayload;

            elErrorDiv.classList.remove('hide');
            elErrorDiv.querySelector('.btn-link').classList.add('hide');
            elPara.classList.remove('alert-warning');
            elPara.classList.add('alert-danger');
            elPara.innerText = Error;
          }
        });
      }
   });
  }
 };

/**
 * Set localStorage session cart.
 * @param {cart} object - shopping cart.
 */
 app.setSessionCart = (cart) => {
   app.config.sessionCart = cart;

   const cartString = JSON.stringify(cart);
   localStorage.setItem('cart', cartString);

   if(typeof(cart) == 'object') app.displayCart(cart);
   else app.displayCart(false);
 };

/**
 * Get session cart from localStorage.
 */
 app.getSessionCart = () => {
   const cartString = localStorage.getItem('cart');

   if(typeof(cartString) == 'string') {
       const cart = JSON.parse(cartString);
       app.config.sessionCart = cart;

       try {
         if(typeof(cart) == 'object') app.displayCart(cart);
         else app.displayCart(false);
       } catch (e) {
         app.config.sessionCart = false;
         app.displayCart(false);
       }
   }
 };

/**
 * Display cart items count.
 * @param {cart} object - cart object
 */
app.displayCart = (cart) => {
   if(typeof(cart)== 'object') {
     const { items } = cart;
     document.getElementById('cartCount').innerText = items.length;
   }
};

/**
 * Process form submission.
 */
app.bindAllForms = () => {
  if(document.querySelector('form')) {
    const allForms = document.querySelectorAll('form');

     for(let i = 0; i < allForms.length; i++) {

      allForms[i].addEventListener('submit', (e) => {
          e.preventDefault();

          const elements = allForms[i].elements;
          const isValidForm = app.validateForm(elements);

          // Proceed if form is valid.
          if(isValidForm) {

            // Display order processing message on checkout page/order form.
            if(allForms[i].id == 'frmOrder') {
              document.getElementById('orderMsg').classList.remove('hide');
            }

            const formId = allForms[i].id;
            const path = allForms[i].action;
            let method = allForms[i].method.toUpperCase();

            // Turn inputs to payload.
            const payload = {};

            for(let j = 0; j < elements.length; j++) {

              // Disable form inputs of frmOrder to prevent another submission.
              if(allForms[i].id == 'frmOrder' && elements[j].type !== 'hidden') {
                elements[j].setAttribute('disabled', 'disabled');
              }

              if(elements[j].type !== 'submit') {
                let nameOfElement = elements[j].name;
                let valueOfElement = elements[j].value;
                payload[nameOfElement] = valueOfElement;

                if(nameOfElement == '_method') {
                  method = valueOfElement.toUpperCase();
                }

                //  Convert string to number for qty field.
                if(allForms[i].id == 'frmCart' && elements[j].type == 'number' && elements[j].name == 'qty') {
                  payload[nameOfElement] = parseInt(valueOfElement);
                }

                  // Get the selected item pan size and price inputs.
                if(allForms[i].id == 'frmCart' && elements[j].type == 'select-one') {
                  const selectedOption = elements[j].options[elements[j].selectedIndex].dataset;
                  payload['pan'] = selectedOption['pan'];
                  payload['price'] = parseFloat(selectedOption['price']);
                }

                // Convert string to number for card expire month and year fields.
                if(allForms[i].id == 'frmOrder' && elements[j].name == 'cardExpireMonth' || elements[j].name == 'cardExpireYear') {
                    payload[nameOfElement] = parseInt(valueOfElement);
                }
              }
            }

          // Add, update or remove cart items.
          if(allForms[i].id == 'frmCart') {
            app.addToCart(payload);
          } else {

          // If the method is DELETE, the payload should be a queryStringObject instead
          const queryStringObject = (method == 'DELETE') ? payload : {};

            app.client.request(path, method, queryStringObject, payload, (statusCode, responsePayload) => {
              if(statusCode == 200) {
                  app.formResponseProcessor(formId, payload, responsePayload);
              } else if(statusCode == 403) {
                 app.logUserOut();
              } else {
                app.formErrorResponse(statusCode, responsePayload);
              }
            });
          }
        } else return;
      });
    }
  }
};

/**
 * Form input validation.
 * @param {elements} object - form elements
 */
app.validateForm = (elements) => {
  if(elements.length > 0 ) {
    let validCount = 0;
    let nonInputs  = 0;

    for(let i = 0; i < elements.length; i++) {
      // Validation rules.
      const emailPattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      // const alphaPattern = /^([ \.]?[A-Za-z]+)$/;
      const yearPattern = /^202[0-9]{1}$/;
      const cvcPattern =  /^[0-9]{3,4}$/;

      const thisYear = (new Date()).getFullYear();

      // Validate only input fields, avoid button types and hidden inputs.
      if(elements[i].type !== 'submit' &&  elements[i].type !== 'hidden') {
        // Get error DOM node.
        const error = elements[i].parentNode.querySelector('.error');

        // Remove previous error messages (if any).
        if(error.innerText !== '') error.innerText = '';

        // Validate form inputs.
        if(elements[i].value == '') {
            error.innerText = 'This field is required.';
        } else if(elements[i].type == 'email' && !emailPattern.test(elements[i].value)) {
            error.innerText = 'Invalid email address.';
        }
        else if(elements[i].name == 'cardExpireYear' && !yearPattern.test(elements[i].value)) {
            error.innerText = 'This field requires only 4 digits.';
        } else if (elements[i].name == 'cardExpireYear' && parseInt(elements[i].value) < thisYear) {
            error.innerText = 'Invalid year.';
        } else if (elements[i].name == 'cardCvc' && !cvcPattern.test(elements[i].value)) {
            error.innerText = 'Invalid cvc number.';
        } else {
          validCount++;
        }
      } else nonInputs++;
    }

    // Form validation, valid input elements count matches the input fields count.
    if(validCount == elements.length - nonInputs) return true;
    else return false;
  }
};

/**
 * Process form success response.
 * @param {formId} string - id of the form
 * @param {payload} object - request data
 * @param {responsePayload} object - response data
 */
app.formResponseProcessor = (formId, requestPayload, responsePayload) => {
  switch(formId) {
    case 'frmSignup':
        const { email, password } = requestPayload;
        const newPayload = {
          email,
          password
        };

        app.client.request('/api/tokens', 'POST', undefined, newPayload, (statusCode, responsePayload) => {
           // Display an error on the form if needed.
           if(statusCode !== 200) {
              // Set the formError field with the error text.
               app.formErrorResponse(statusCode, responsePayload);
           } else {
             // If success, set the token and redirect the user.
             app.setSessionToken(responsePayload);
             window.location = '/menu';
           }
        });
    break;
    case 'frmLogin':
      app.setSessionToken(responsePayload);
      app.getCartData();
      window.location = '/menu';
    break;
    case 'frmAccEdit':
      const elDiv = document.getElementById('editResponse')
      const elMsgPara = document.createElement('p');
      const classes = ['alert', 'alert-success'];
      elMsgPara.classList.add(...classes);
      elMsgPara.innerText = 'Your user account updated successfully.';

      if(!elDiv.hasChildNodes()) {
          elDiv.appendChild(elMsgPara);
      }
    break;
    case 'frmAccPassword':
      const elResponseDiv = document.getElementById('passwordResponse')
      const elPara = document.createElement('p');
      const cls = ['alert', 'alert-success'];
      elPara.classList.add(...cls);
      elPara.innerText = 'Your user password changed successfully. Please wait, redirecting to login...';

      if(!elResponseDiv.hasChildNodes()) {
          elResponseDiv.appendChild(elPara);
      }

      setTimeout(()=> {
        app.setSessionToken(false);
        app.setLoggedInClass(false);
        app.setSessionCart(false);
        window.location = 'account/login';
      }, 10000);
    break;
    case 'frmAccDelete':
      app.setLoggedInClass(false);
      app.setSessionToken(false);
      app.setSessionCart(false);
      window.location = '/account/deleted';
    break;
    case 'frmOrder':
      app.setSessionCart(false);
      window.location = '/order/confirm';
    break;
  }
}

/**
 * Display form submission error responses.
 * @param {statusCode} number - response status code
 * @param {responsePayload} object - response object
 */
app.formErrorResponse = (statusCode, responsePayload) => {
  const elErrorDiv = document.querySelector('div.form-response');

  if(statusCode == 400 || statusCode == 500) {
    const { Error } = responsePayload;
    const elErrorPara = document.createElement('p');

    elErrorPara.innerText = Error;
    const styles = ['alert', 'alert-danger'];
    elErrorPara.classList.add(...styles);

    if(elErrorDiv.hasChildNodes()) {
      elErrorDiv.removeChild(elErrorDiv.firstChild);
    }

    if(!elErrorDiv.hasChildNodes()) {
      elErrorDiv.appendChild(elErrorPara);
    }
  }
};

/**
 *  Select pan size to display pan price on item page.
 */
app.selectPriceByPanType = () => {
  if (document.getElementsByTagName('body')[0].id == 'item') {
        document.getElementById('itemInfo').addEventListener('change', (e) => {
          if(e.target.id == 'selectPanType')  {
            const price = (e.target.options[e.target.selectedIndex]).dataset.price;
            document.querySelector('.price').innerText = `$ ${price}`;
          }
        });
  }
}

/**
 * Log the user out then redirect to menu.
 */
app.logUserOut = () => {

  // Get the current token id.
  let { id } = app.config.sessionToken;
  id = typeof(id) == 'string' ? id : false;

  if(id) {
    const queryStringObject = {
      id
    };

    app.client.request('/api/tokens', 'DELETE', queryStringObject, undefined, (statusCode, responsePayload) => {
      if(statusCode == 200) {
        app.setSessionCart(false);
        app.setSessionToken(false);
        app.setLoggedInClass(false);

        window.location = '/';
      }
    });
  }
};

/**
 * Log out button event.
 */
app.btnLogoutEvent = () => {
    document.getElementById('logout').addEventListener('click', (e) => {
      e.preventDefault();
      app.logUserOut();
    });
};

/**
 * Get session token from localStorage.
 */
app.getSessionToken = () => {
  const tokenString = localStorage.getItem('token');

  if(typeof(tokenString) == 'string') {
      const token = JSON.parse(tokenString);
      app.config.sessionToken = token;

      try {
        if(typeof(token) == 'object') app.setLoggedInClass(true);
        else app.setLoggedInClass(false);
      } catch (e) {
        app.config.sessionToken = false;
        app.setLoggedInClass(false);
      }
  }
};

/**
 * Set logged in class.
 * @param {isLoggedIn} boolean - logged in/out status
 */
app.setLoggedInClass = (isLoggedIn) => {
  const body = document.querySelector('body');

  if(isLoggedIn) body.classList.add('loggedin');
  else body.classList.remove('loggedin');
};


/**
 * Set the session token.
 * @param {token} object - session token object (email, tokenId)
 */
app.setSessionToken = (token) => {

  app.config.sessionToken = token;
  const tokenString = JSON.stringify(token);
  localStorage.setItem('token', tokenString);

  if(typeof(token) == 'object') app.setLoggedInClass(true);
  else app.setLoggedInClass(false);
};

/**
 * Renew session token to keep the session live.
 * @param {callback} function -
 */
app.renewToken = (callback) => {
  let { sessionToken } = app.config;
  sessionToken = typeof(sessionToken) == 'object' ? sessionToken : false;

  if(sessionToken) {
    const { id } = sessionToken;
    const payload = {
      id,
      'extend': true
    };

    app.client.request('/api/tokens', 'PUT', undefined, payload, (statusCode, responsePayload) => {
      if(statusCode == 200) {
        // Retrieve new token details.
        const queryStringObject = {
          id
        };

        app.client.request('/api/tokens', 'GET', queryStringObject ,undefined, (statusCode, responsePayload) => {
          if(statusCode == 200) {
            app.setSessionToken(responsePayload);
            callback(false);
          } else {
            app.setSessionToken(false);
            callback(true);
          }
        });
      } else {
        app.setSessionToken(false);
        callback(true);
      }
    });
  } else {
    app.setSessionToken(false);
    callback(true);
  }
};

/**
 * Loop to renew token every one minute.
 */
app.tokenRenewalLoop = () => {
  setInterval(() => {
    app.renewToken(err => {
      if(!err) console.log("Token renewed successfully @ "+ new Date());
    });
  }, 1000 * 60);
};

/** Initialize the app. */
app.init = () => {
  // bind forms.
  app.bindAllForms();

  // Bind to log out button.
  app.btnLogoutEvent();

  // Get the token from localstorage.
  app.getSessionToken();

  // Get cart.
  app.getSessionCart();

   // Renew token.
  app.tokenRenewalLoop();

  // Remove items.
  app.bindRemoveItemsEvent();

  // Set pan price.
  app.selectPriceByPanType();

  // load user data to display.
  app.loadUser();

  // Load data on page.
  app.loadDataOnPage();
};

/** Call the init processes after the window loads. */
window.onload = () => {
  app.init();
};
