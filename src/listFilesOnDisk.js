//@flow
import type {Groups, FileFilter, FileMap} from './types';
const fs = require('fs');
const path = require('path');
const glob = require('glob');
const calcETag = require('./calcETag');

const toFilterFunction = function(
  filter: RegExp | FileFilter,
  defaultFilter: FileFilter
): FileFilter {
  if (!filter) {
    return defaultFilter;
  }

  if (filter instanceof RegExp) {
    return file => filter.test(file);
  }

  return filter;
};

const listFiles = (source: string): Promise<Array<string>> =>
  new Promise((resolve, reject) => {
    glob('**/*', {cwd: source, nodir: true}, (error, files) => {
      if (error) {
        reject(error);
      } else {
        resolve(files);
      }
    });
  });

module.exports = async function(groups: Groups): Promise<FileMap> {
  const filesOnDisk = [];
  return Promise.all(
    groups.map(group => {
      const source = path.resolve(group.source || '');
      const include = toFilterFunction(group.include, () => true);
      const exclude = toFilterFunction(group.exclude, () => false);
      const prefix = group.prefix || '';
      const params = group.params || {};

      if (!fs.existsSync(source)) {
        return Promise.reject(
          new Error(`Group source "${source}" does not exist.`)
        );
      }

      return listFiles(source).then(files =>
        files.map(file => {
          const fullPath = path.resolve(source, file);
          const fullKey = path.join(prefix || '', file).replace(/\\/g, '/');

          //filter the files by key
          if (include(fullKey) && !exclude(fullKey)) {
            //check if we've already added this file from another group
            if (filesOnDisk.find(fileOnDisk => fileOnDisk.path === fullPath)) {
              return Promise.reject(
                new Error(`File "${fullPath}" is matched by multiple groups.`)
              );
            }

            //get the etag
            return calcETag(fullPath).then(etag => {
              //add the file to the list of files on disk
              filesOnDisk[fullKey] = {
                path: fullPath,
                hash: etag,
                params
              };
            });
          }
        })
      );
    })
  ).then(() => filesOnDisk);
};
