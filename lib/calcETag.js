const fs = require('fs');
const crypto = require('crypto');

module.exports = async function(path) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('md5');

    fs.createReadStream(path)
      .on('data', data => {
        hash.update(data, 'utf8');
      })
      .on('end', () => {
        const md5 = hash.digest('hex');
        resolve(md5);
      })
      .on('error', reject)
    ;

  });
};
