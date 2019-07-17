/**
 * @module lib/config
 * Application configuration.
 *
 * Instructions:
 * Insert your hashing secret.
 * Insert Stripe PUBLIC API KEY and SECRET.
 * Insert Mailgun API KEY, and DOMAIN NAME in place of 'YOURDOMAIN'.
 */

const environments = {};

/** Stagging environment (default) */
environments.staging = {
  'httpPort': 3000,
  'httpsPort': 3001,
  'envName': 'staging',
  'hashingSecret': 'YOUR HASHING SECRET HERE',
  'stripe':{
   'baseUrl':'api.stripe.com',
   'publicKey': 'YOUR API KEY HERE',
   'secret': 'YOUR SECRET KEY HERE'
  },
  'mailgun': {
   'baseUrl':'api.mailgun.net',
   'apiKey':'YOUR API KEY HERE',
   'domainName':'YOURDOMAIN.mailgun.org',
   'from':'cheesydelights@YOURDOMAIN.mailgun.org'
 },
 'templateGlobals': {
   'appName': 'CheesyDelights',
   'companyName': 'Cheesy Delights, Inc.',
   'yearCreated': '2019',
   'baseUrl': 'https://localhost:3001/'
 }
};

 /** Production environment */
environments.production = {
  'httpPort': 5000,
  'httpsPort': 5001,
  'envName': 'production',
  'hashingSecret': 'YOUR HASHING SECRET HERE',
  'stripe':{
      'baseUrl':'api.stripe.com',
      'publicKey': 'YOUR API KEY HERE',
      'secret': 'YOUR SECRET KEY HERE'
  },
  'mailgun': {
    'baseUrl':'api.mailgun.net',
    'apiKey':'YOUR API KEY HERE',
    'domainName':'YOURDOMAIN.mailgun.org',
    'from':'cheesydelights@YOURDOMAIN.mailgun.org'
  },
  'templateGlobals': {
    'appName': 'CheesyDelights',
    'companyName': 'Cheesy Delights, Inc.',
    'YearCreated': '2019',
    'baseUrl': 'https://localhost:5001/'
  }
};

const currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

const environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment]: environments.staging;

module.exports = environmentToExport;
