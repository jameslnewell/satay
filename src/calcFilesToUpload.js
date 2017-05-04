const calcETag = require('./calcETag');

module.exports = async function(filesOnDisk, objectsInBucket, forceUpload) {

  if (forceUpload) {
    return filesOnDisk;
  }

  const filesToUpload = [];
  return Promise.all(filesOnDisk.map(file => {
    return calcETag(file.path)
      .then(etag => {
        const object = objectsInBucket.find(obj => obj.Key === file.key);
        if (!object || `"${etag}"` !== object.ETag) {
          filesToUpload.push(file);
        }
      })

  }))
    .then(() => filesToUpload)
  ;

};
