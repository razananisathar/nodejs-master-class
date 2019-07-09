/**
 * @module lib/data
 * File system handling functions.
 */

 /** Module dependencies. */
 const fs = require('fs');
 const path = require('path');
 const helpers = require('./helpers');

 /** Instantiate the lib module object */
const lib = {};

/** Base directory of the data folder */
lib.baseDir = path.join(__dirname, '/../.data/');

/**
 * Create a new json file in a given directory and Write data into the new file.
 * @param {dir} string - directory name
 * @param {file} string - file name
 * @param {data} object - data to write into the file
 */
lib.create = (dir, file, data, callback) => {
  // Open the file for writing.
  fs.open(`${lib.baseDir}${dir}/${file}.json`, 'wx', (err, fileDescriptor) => {
    if(!err && fileDescriptor) {
      // Convert data to string.
      const stringData = JSON.stringify(data);

      // Write to file and close it.
      fs.writeFile(fileDescriptor, stringData, (err) => {
        if(!err) {
          fs.close(fileDescriptor, (err) => {
            if(!err) callback(false);
            else callback('Error closing the file.');
          });
        } else callback('Error writing to new file.');
      });
    } else callback('Could not create new file, it may already exist.');
  });
};

/**
 * Read data from a json file in a given directory.
 * @param {dir} string - directory name
 * @param {file} string - file name
 */
lib.read = (dir, file, callback) => {
  fs.readFile(`${lib.baseDir}${dir}/${file}.json`, 'utf8', (err, data) => {
    if(!err && data) {
      const parseData = helpers.parseJSONToObject(data);
      callback(false, parseData);
    } else callback(err, data);
  });
};

/**
 * Update data in a json file in a given directory.
 * @param {dir} string - directory name
 * @param {file} string - file name
 * @param {data} object - data to write into the file
 */
lib.update = (dir, file, data, callback) => {
  fs.open(`${lib.baseDir}${dir}/${file}.json`, 'r+', (err, fileDescriptor) => {
    if(!err && fileDescriptor) {
      const stringData = JSON.stringify(data);

      fs.truncate(fileDescriptor, (err) => {
        if(!err) {
          // Write content to the file and close it.
          fs.writeFile(fileDescriptor, stringData, (err) => {
            if(!err) {
              fs.close(fileDescriptor, (err) => {
                if(!err) callback(false);
                else callback('Error closing the file.');
              });
            } else callback('Error writing to existing file.');
          });
        } else callback('Error truncating the file.');
      });
    } else callback('Could not open the file for updating. It may not exist yet.');
  });
};

/**
 * Delete a json file in a given directory.
 * @param {dir} string - directory name
 * @param {file} string - file name
 */
lib.delete = (dir, file, callback) => {
  // Unlink the file from the filesystem
  fs.unlink(`${lib.baseDir}${dir}/${file}.json`, (err) => callback(err));
};

/**
 * List all the file names in a given directory.
 * @param {dir} string - directory name
 */
lib.list = (dir, callback) => {
  fs.readdir(`${lib.baseDir}${dir}/`, (err, data) => {
      if(!err && data && data.length > 0) {
          const trimmedFileNames = [];
          data.forEach(fileName => trimmedFileNames.push(fileName.replace('.json', '')));
          callback(false, trimmedFileNames);
      } else callback(err, data);
  });
};

module.exports = lib;
