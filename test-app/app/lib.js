/**
 * @module lib
 */
fs = require('fs');
path = require('path');

/** Instantiate lib module object */
const lib = {};

lib.dir = path.join(__dirname, './data/');

/**
 * Check whether passed string is a palindrome. (A word, phrase, or sequence that reads the same backwards as forward.)
 * @param {str} string - string input
 */
lib.isPalindrome = (str) => {
  str = typeof(str) == 'string' && str.trim().length > 0 ? str : false;

  if(str) {
    const text = str.toLowerCase().replace(/\s/g,'');
    const len = text.length;

    return text.split('').every((char, index) => char === text[len-1-index]);
  }
};

/**
 * Check whether passed number is prime or not.
 * @param {number} number - number input
 */
lib.isPrime = (number) => {
  number = typeof(number) == 'number' && number > 0 ? number : false;

  if(number) {
    if(number == 1) return false;
    else if (number == 2) return true;
    else {
      for(let i = 2; i < number; i++) {
        if(number%i == 0) return false;
      }
      return true;
    }
  }
};

/**
 * Capitalize the first letter of each word in a sentece
 * @param {str} string - string input
 */
lib.capitalize = (str) => {
  str = typeof(str) == 'string' && str.trim().length > 0 ? str : false;

  if(str) {
    const arr = str.toLowerCase().split(' ');
    return arr.map(val => val.charAt(0).toUpperCase() + val.substr(1, val.length)).join(' ');
  }
};

/**
 * Read data from a json file.
 * @param {fileName} string - name of the file
 */
lib.readJSONFile = (fileName, callback) => {
  fs.readFile(`${lib.dir}/${fileName}`, 'utf8', (err, data) => {
     if (err) return callback(err);

     try {
       const res = JSON.parse(data);
     } catch(e) {
          callback(e);
     }

    callback(res);
  });
};

/**
 * Count the number of vowels in given string of words or phrases.
 * @param {str} string - string input
 */
lib.countVowels = (str) => {
  str = typeof(str) == 'string' && str.trim().length > 0 ? str : false;

  if(str) {
    const vowels = 'aeiou';

    const count = Array.from(str.toLowerCase()).reduce((acc, cur)  => {
      if(vowels.includes(cur)) acc++;
      return acc;
      }, 0);

     return count;
  }
};

module.exports = lib;
