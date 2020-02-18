/**
 * Test Runner.
 */

/** Application logic for test runner. */
const _app = {};

/** container for the tests */
_app.tests = {};

/** Add on the unit test as dependency. */
_app.tests.unit = require('./unit');


/** Count total number of test cases */
_app.countTests = () => {
  let counter = 0;
  for(const key in _app.tests) {
    if(_app.tests.hasOwnProperty(key)) {
      const subTests = _app.tests[key];

      for(const testName in subTests) {
        if(subTests.hasOwnProperty(testName)) counter++;
      }
    }
  }

  return counter;
};

/** Run all the tests, collect success and failed tests. */
_app.runTests = () => {
  let errors = [];
  let successes = 0;
  let counter = 0;
  const limit = _app.countTests();

  for(const key in _app.tests) {
    if(_app.tests.hasOwnProperty(key)) {
      const subTests = _app.tests[key];

      for(const testName in subTests) {
        if(subTests.hasOwnProperty(testName)) {
          (() => {
            let tempTestName = testName;
            let testValue = subTests[testName];

            try {
              testValue(() => {
                // If it calls back without throwing then it succeeded, then log it in green.
                console.log('\x1b[32m%s\x1b[0m', tempTestName);
                counter++;
                successes++;

                if(counter == limit) {
                  _app.produceTestReport(limit, successes, errors);
                }
              });
            } catch(e) {
              // If it throws then it failed, then log it in red.
              errors.push({
                'name': testName,
                'error': e
              });

              console.log('\x1b[31m%s\x1b[0m', tempTestName);
              counter++;

              if(counter == limit) {
                 _app.produceTestReport(limit, successes, errors);
              }
            }
          })();
        }
      }
    }
  }
};

/**
 * produce a test outcome report
 * @param {limit} number - total number of test cases.
 * @param {successes} number - total number of passed tests.
 * @param {errors} object - Array of errors
 */
_app.produceTestReport = (limit, successes, errors) => {
  console.log('');
  console.log('\x1b[34m%s\x1b[0m', '------------------BEGIN TEST REPORT------------------');
  console.log('');
  console.log('\x1b[33m%s\x1b[0m', `Total Tests: ${limit}`);
  console.log('\x1b[33m%s\x1b[0m', `Pass: ${successes}`);
  console.log('\x1b[33m%s\x1b[0m', `Fail: ${errors.length}`);
  console.log('');

  // If there are errors print them in detail.
  if(errors.length > 0) {
    console.log('\x1b[34m%s\x1b[0m', '------------------BEGIN ERROR DETAILS------------------');
    console.log('');

    errors.forEach(testError => {
        console.log('\x1b[31m%s\x1b[0m', testError.name);
        console.log(testError.error);
        console.log('');
    });

    console.log('');
    console.log('\x1b[34m%s\x1b[0m', '------------------END ERROR DETAILS------------------');
  }

  console.log('');
  console.log('\x1b[34m%s\x1b[0m', '------------------END TEST REPORT------------------');
  process.exit(0);
};


/** Execute tests */
_app.runTests();
