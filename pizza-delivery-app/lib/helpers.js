/**
 * @module lib/helpers
 * All the helper functions.
 */

/** Module dependencies */
const crypto = require('crypto');
const config = require('./config');
const https = require('https');
const querystring = require('querystring');

 /** Instantiate the helpers module object */
const helpers = {};

/**
 * Hash a given string value.
 * @param {str} string - string input to hash
 */
helpers.hash = (str) => {
  try {
    if(typeof(str) == 'string' && str.length > 0) {
      const hash = crypto.createHmac('SHA256', config.hashingSecret).update(str).digest('hex');
      return hash;
    }
  } catch(e) {
    return false;
  }
};

/**
 * Parse a JSON string to an object.
 * @param {str} string - JSON String
 */
helpers.parseJSONToObject = (str) => {
      try {
        return JSON.parse(str);
      } catch(e) {
        return {};
      }
};

/**
 * Generate a random string for a given length of characters.
 * @params {strLen} number - length of the string
 */
helpers.generateRandomString = (strLen) => {
  strLen = typeof(strLen) == 'number' && strLen > 0 ? strLen: false;
  if(strLen) {
    // Define all the possible characters that could go into string.
    const possibleChars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let str = '';
    for(let i = 1; i <= strLen; i++) {
      let randomChar = possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));
      str += randomChar;
    }
    return str;
  } else return false;
};

/**
 * Validate the email address.
 * @param {email} string - email address
 */
helpers.validateEmailAddress = (email) => {
  try {
    const pattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return pattern.test(email.toLowerCase());
  } catch(e) {
    return false;
  }
};

/**
 * Convert an object to query string.
 * @param {prefix} string - object params nested.
 * @param {obj} object - object to encode.
 */
helpers.objectToQueryString = (prefix, obj) => {
  if(prefix && obj) {
    const queryString = Object.entries(obj).map(([key,val]) => {
      return [`${encodeURIComponent(prefix +'['+ key + ']')}`,`${encodeURIComponent(val)}`].join('=')
     }).join('&');
     return queryString;
  } else return false;
};

/**
 * Fetch a token object from Stripe for a card.
 * @param {name} string - card holder's name
 * @param {number} string - card number
 * @param {cvc} string - card cvc (three or four digits number)
 * @param {expMonth} number - card expiration month
 * @param {expYear} number - card expiration year
 */
helpers.getStripeToken = (name, number, cvc, expMonth, expYear, callback) => {
  if(name && number && cvc && expMonth && expYear) {
      const payload = {
            number,
            'exp_month': expMonth,
            'exp_year': expYear,
            cvc
      };

      const stringPayload = helpers.objectToQueryString('card', payload);

      // Request details.
      const options = {
        'protocol': 'https:',
        'hostname': `${config.stripe.baseUrl}`,
        'method': 'POST',
        'path': '/v1/tokens',
        'auth': `${config.stripe.secret}:`,
        'headers': {
          'Content-Type' : 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(stringPayload)
        }
      };

      // Craft https request.
      const req = https.request(options, (res) => {
        const status = res.statusCode;
        res.setEncoding('utf8');
        // Success response.
        if(status == 200 || status == 201) {
          // Return token object.
          let data = '';
          res.on('data',(chunk) => data += chunk );
          res.on('end', () => {
            const responseData = helpers.parseJSONToObject(data);
            callback(responseData);
          });
        } else callback(`Status code returned was .${status}`);
      });

      // Bind to the error event so it doesn't get thrown.
      req.on('error',(e) => callback(e));

      // Add the payload.
      req.write(stringPayload);

      // End the request.
      req.end();

  } else callback('Given parameters were missing or invalid.');
};

/**
 * Process payment by creating a Stripe charge object.
 * @param {token} string - stripe token id
 * @param {email} string - user's email address
 * @param {name} string - card holder's name
 * @param {number} string - card number
 * @param {cvc} string - card cvc (three or four digits number)
 * @param {expMonth} number - card expiration month
 * @param {expYear} number - card expiration year
 * @param {amount} number - amount to charge
 */
helpers.doStripePayment = (token, email, name, number, cvc, expMonth, expYear, amount, callback) => {
  if(token && email && name && number && cvc && expMonth && expYear && amount) {
    // Note: amount is in dollars (Stripe amount calculates 100 cents to charge $1.00, therefore amount multipled by 100)
    const payload = {
      'amount': amount*100,
      'currency': 'usd',
      'source': token,
      'description': `Charge for ${email}`
    };

    const stringPayload = querystring.stringify(payload);
    // Request details.
    const options = {
      'protocol': 'https:',
      'hostname': config.stripe.baseUrl,
      'method': 'POST',
      'path': '/v1/charges',
      'auth': `${config.stripe.secret}:`,
      'headers': {
        'Content-Type' : 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(stringPayload)
      }
    };

    // Craft https request.
    const req = https.request(options, (res) => {
        const status = res.statusCode;
        res.setEncoding('utf8');

        if(status == 200 || status == 201) {
          // Return charge object.
          let data = '';
          res.on('data',(chunk) =>  data += chunk);
          res.on('end', () => {
            const responseData = helpers.parseJSONToObject(data);
            callback(responseData);
          });
        } else callback(`Status code returned was .${status}`);
    });

    // Bind to the error event so it doesn't get thrown.
    req.on('error',(e) => callback(e));

    // Add the payload.
    req.write(stringPayload);

    // End the request.
    req.end();

  } else callback('Given parameters were missing or invalid.');
};

/**
 * Process Stripe payment.
 * @param {email} string - user's email address
 * @param {name} string - card holder's name
 * @param {number} string - card number
 * @param {cvc} string - card cvc (three or four digits number)
 * @param {expMonth} number - card expiration month
 * @param {expYear} number - card expiration year
 * @param {amount} number - amount to charge
 */
helpers.sendPayment = (email, name, number, cvc, expMonth, expYear, amount, callback) => {
  email = typeof(email) == 'string' && email.trim().length > 0 && helpers.validateEmailAddress(email) ? email.trim() : false;
  name = typeof(name) == 'string' && name.trim().length > 0 ? name.trim() : false;
  number = typeof(number) == 'string' && number.trim().length == 16 ? number.trim() : false;
  cvc = typeof(cvc) == 'string' && (/^[0-9]{3,4}$/).test(cvc) ? cvc : false;
  expMonth = typeof(expMonth) == 'number' &&  expMonth > 0 && expMonth <= 12 ? expMonth : false;
  expYear = typeof(expYear) == 'number' && (/^\d{2}|\d{4}$/).test(expYear)? expYear : false;
  amount = typeof(amount) == 'number' && amount >= 0.50 ? amount : false;

  if(email && name && number && cvc && expMonth && expYear && amount) {
    // Get Stripe token.
    helpers.getStripeToken(name, number, cvc, expMonth, expYear, (tokenData) => {
        if(typeof(tokenData) == 'object') {
            // Extract token id.
            const { id } = tokenData;
          // Stripe transaction.
          helpers.doStripePayment(id, email, name, number, cvc, expMonth, expYear, amount, (chargeObj) => {
            if(typeof(chargeObj) == 'object') callback(false, chargeObj);
            else callback('Stripe could not charge the card.');
          });
        } else callback('Stripe could not create a token.');
    });
  } else callback('Given parameters were missing or invalid.');
};

/**
 * Send the order receipt to the user via email using mailgun email service.
 * @param {to} string - user's email address
 * @param {receiptNo} string - card holder's name
 * @param {receiptUrl} string - card number
 */
helpers.sendEmail = (to, receiptNo,  firstName, lastName, amount, items, callback) => {
  to = typeof(to) == 'string' && to.trim().length > 0 ? to.trim() : false;
  receiptNo = typeof(receiptNo) == 'string' && receiptNo.trim().length > 0 ? receiptNo.trim() : false;
  firstName = typeof(firstName) == 'string' && firstName.trim().length > 0 ? firstName.trim() : false;
  lastName = typeof(lastName) == 'string' && lastName.trim().length > 0 ? lastName.trim() : false;
  amount = typeof(amount) == 'number' && amount >= 0.50 ? amount : false;
  items = typeof(items) == 'object' && items instanceof Array ? items : [];
  const len = items.length;

  if(to && receiptNo && firstName && lastName && amount && len > 0) {

    const html = helpers.composeHtmlReceipt(receiptNo, amount, items, firstName, lastName);

    const payload = {
      'from': `Cheesy Delights <${config.mailgun.from}>`,
      'to': to,
      'subject': `Your Order Reciept from Cheesy Delights - #${receiptNo}`,
      'html': html
    };

    const stringPayload = querystring.stringify(payload);

    // Request details.
    const options = {
      'protocol':'https:',
      'hostname': config.mailgun.baseUrl,
      'method': 'POST',
      'path': `/v3/${config.mailgun.domainName}/messages`,
      'auth': `api:${config.mailgun.apiKey}`,
      'headers': {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(stringPayload)
      }
    };

    // Craft https request.
    const req = https.request(options, res => {
      const status = res.statusCode;

      if(status == 200 || status == 201) {
        // Return response.
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          responseData = helpers.parseJSONToObject(data);
          callback(false, responseData);
        });
      }else callback(`Status code returned was .${status}`);
    });

    // Bind to the error event so it doesn't get thrown
    req.on('error',(e) => callback(e));

    // Add the payload
    req.write(stringPayload);

    // End the request
    req.end();

  } else callback('Given parameters were missing or invalid.');
};

/**
 * Compose html receipt to send in email.
 * @param {receiptNo} string - reference no of the receipt
 * @param {amount} number - total amount paid
 * @param {items} array - array of ordered items
 * @param {firstName} string - user's first name
 * @param {lastName} string - user's last name
 */
helpers.composeHtmlReceipt = (receiptNo, amount, items, firstName, lastName) => {

  const head = `
        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
        <html xmlns="http://www.w3.org/1999/xhtml">
        <head>
        <meta name="viewport" content="width=device-width" />
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <title>Order Receipt | Cheesy Delights, Inc.</title>
        <style type="text/css">
          * {
            margin: 0;
            padding: 0;
            font-family: "Helvetica Neue", "Helvetica", Helvetica, Arial, sans-serif;
            box-sizing: border-box;
            font-size: 14px;
          }
          body {
            -webkit-font-smoothing: antialiased;
            -webkit-text-size-adjust: none;
            width: 100% !important;
            height: 100%;
            line-height: 1.6;
          }
          table td {
            vertical-align: top;
          }
          body {
            background-color: #f6f6f6;
          }
          .body-wrap {
            background-color: #f6f6f6;
            width: 100%;
          }
          .container {
            display: block !important;
            max-width: 600px !important;
            margin: 0 auto !important;
            /* makes it centered */
            clear: both !important;
          }
          .content {
            max-width: 600px;
            margin: 0 auto;
            display: block;
            padding: 20px;
          }
          .main {
            background: #fff;
            border: 1px solid #e9e9e9;
            border-radius: 3px;
          }
          .content-wrap {
            padding: 20px;
          }
          .content-block {
            padding: 0 0 20px;
          }
          .footer {
            width: 100%;
            clear: both;
            color: #999;
            padding: 20px;
          }
          h1, h2 {
            font-family: "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif;
            color: #000;
            margin: 40px 0 0;
            line-height: 1.2;
            font-weight: 400;
          }
          h1 {
            font-size: 32px;
            font-weight: 500;
          }
          h2 {
            font-size: 24px;
          }
          .aligncenter {
            text-align: center;
          }
          .alignright {
            text-align: right;
          }
          .alignleft {
            text-align: left;
          }
          .clear {
            clear: both;
          }
          .invoice {
            margin: 40px auto;
            text-align: left;
            width: 80%;
          }
          .invoice td {
            padding: 5px 0;
          }
          .invoice .invoice-items {
            width: 100%;
          }
          .invoice .invoice-items td {
            border-top: #eee 1px solid;
          }
          .invoice .invoice-items .total td {
            border-top: 2px solid #333;
            border-bottom: 2px solid #333;
            font-weight: 700;
          }
          @media only screen and (max-width: 640px) {
            h1, h2 {
              font-weight: 600 !important;
              margin: 20px 0 5px !important;
            }
            h1 {
              font-size: 22px !important;
            }
            h2 {
              font-size: 18px !important;
            }

            h3 {
              font-size: 16px !important;
            }
            .container {
              width: 100% !important;
            }
            .content, .content-wrapper {
              padding: 10px !important;
            }
            .invoice {
              width: 100% !important;
            }
        }
        </style>
        </head>`;

  const beginBody = `
        <body>
        <table class="body-wrap">
          <tr>
            <td></td>
            <td class="container" width="600">
              <div class="content">
                <table class="main" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td class="content-wrap aligncenter">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td class="content-block">
                            <h1>$ ${amount.toFixed(2)} Paid</h1>
                          </td>
                        </tr>
                        <tr>
                          <td class="content-block">
                            <h2>Thanks for ordering pizza with us.</h2>
                          </td>
                        </tr>
                        <tr>
                          <td class="content-block">
                            <table class="invoice">
                              <tr>
                                <td>${firstName}&nbsp;${lastName}<br>${new Date().toLocaleString()}<br>Invoice #:&nbsp;${receiptNo}</td>
                              </tr>
                              <tr>
                          <td>`;

  let receiptBody = '';

  items.forEach(({name, pan, price, qty}) => {
      const row = `<tr>
                      <td>${name} - ${pan} x ${qty} </td>
                      <td class="alignright">$ ${(qty * price).toFixed(2)}</td>
                  </tr>`;
      receiptBody += row;
  });

  const receipt = `<table class="invoice-items" cellpadding="0" cellspacing="0">
                    ${receiptBody}
                    <tr class="total">
                      <td class="alignright" width="80%">Total</td>
                      <td class="alignright">$ ${amount.toFixed(2)}</td>
                    </tr>
                  </table>`;

  const footer = `</td>
                  </tr>
                  </table>
                  </td>
                  </tr>
                  </table>
                  </td>
                  </tr>
                  </table>
                  <div class="footer">
                  <table width="100%">
                  <tr>
                  <td class="aligncenter content-block">&copy;&nbsp;Cheesy Delights, Inc.</td>
                  </tr>
                  </table>
                  </div></div>
                  </td>
                  <td></td>
                  </tr>
                  </table>
                  </body>
                  </html>`;

  const html = `${head}${beginBody}${receipt}${footer}`;
  return html;
};

module.exports = helpers;
