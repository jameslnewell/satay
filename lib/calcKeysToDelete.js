const diff = require('lodash.difference');

module.exports = function(filesOnDisk, objectsInBucket) {
  const keysInBucket = objectsInBucket.map(file => file.Key);
  const keysToUpload = filesOnDisk.map(file => file.key);
  return diff(keysInBucket, keysToUpload);
};
