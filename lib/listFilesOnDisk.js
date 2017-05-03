const fs = require('fs');
const path = require('path');
const glob = require('glob');
const sortBy = require('lodash.sortby');

const createFilter = (filter, defaultFilter) => {

  if (!filter) {
    return defaultFilter;
  }

  if (filter instanceof RegExp) {
    return file => filter.test(file);
  }

  return filter;
};

module.exports = async function(groups) {
  const filesOnDisk = [];
  return Promise.all(groups.map(group => new Promise((resolve, reject) => {

    const source = path.resolve(group.source || '');
    const include = createFilter(group.include, () => true);
    const exclude = createFilter(group.exclude, () => false);
    const prefix = group.prefix || '';
    const params = group.params || {};

    if (!fs.existsSync(source)) {
      reject(new Error(`Group source "${source}" does not exist.`));
      return;
    }

    glob('**/*', {cwd: source, nodir: true}, (error, files) => {

      if (error) {
        reject(error);
        return;
      }

      files.forEach(file => {

        const filePath = path.resolve(source, file);
        const objectKey = path.join(prefix || '', file).replace(/\\/g, '/');

        //filter the file
        if (include(filePath) && !exclude(filePath)) {

          //check if we've already added this file in another group
          if (filesOnDisk.find(fileOnDisk => fileOnDisk.path === filePath)) {
            reject(new Error(`File "${filePath}" is matched by multiple groups.`));
            return;
          }

          //add the file to the list of files ready for upload
          filesOnDisk.push({
            path: filePath,
            key: objectKey,
            params
          });

          resolve();

        }

      });

    });
  })))
    .then(files => sortBy(filesOnDisk, ['key']))
  ;
};

//TODO: error if the same file is included twice