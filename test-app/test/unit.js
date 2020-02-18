/**
 * Unit tests.
 */

/** Module dependencies */
const lib = require('./../app/lib.js');
const assert = require('assert');

/** Holder for unit tests */
const unit = {};

unit['lib.isPalindrome should return true for palindrome'] = (done) => {
  const result = lib.isPalindrome('Nurses run');
  assert.ok(result);
  done();
};

unit['lib.isPalindrome should return false for non palindrome'] = (done) => {
  const result = lib.isPalindrome('Hello');
  assert.ok(result == false);
  done();
};

unit['lib.isPrime should accept only number input'] = (done) => {
  const result = lib.isPrime(5);
  assert.ok(typeof(result), 'number');
  done();
};

unit['lib.isPrime should return false for input number 1'] = (done) => {
  const result = lib.isPrime(1);
  assert.ok(result == false);
  done();
};

unit['lib.isPrime should return true for input number 2'] = (done) => {
  const result = lib.isPrime(2);
  assert.ok(result);
  done();
};

unit['lib.isPrime should return false for non-prime number'] = (done) => {
  const result = lib.isPrime(98);
    assert.ok(result == false);
  done();
};

unit['lib.isPrime should return true for prime number'] = (done) => {
  const result = lib.isPrime(97);
  assert.ok(result);
  done();
};

unit['lib.capitalize should accept only string input'] = (done) => {
  const result = lib.capitalize('hello world');
  assert.equal(typeof(result), 'string');
  done();
};

unit['lib.capitalize should return first letter of each word in a sentence'] = (done) => {
  const result = lib.capitalize('i love javascript. I\'m LEARNING Node.js.');
  assert.equal(result, 'I Love Javascript. I\'m Learning Node.js.');
  done();
};

unit['lib.readJSONFile should not throw error for non existing file. It should callback an error instead'] = (done) => {
  assert.doesNotThrow(() => {
    lib.readJSONFile('I do not exist', (err, data) => {
      assert.ok(err);
      done();
    });
  }, TypeError);
};

unit['lib.countVowels should return the number of vowels in a given word or phrase'] = (done) => {
  const result = lib.countVowels('hello world apple');
  assert.equal(result, 5);
  done();
}

module.exports = unit;
