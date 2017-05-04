//@flow
import type {FileMap, ObjectMap, FileStatuses} from './types';

module.exports = function(
  filesOnDisk: FileMap,
  objectsInBucket: ObjectMap,
  forceUpload: boolean
): FileStatuses {
  const diff = {};

  //calculate whether files on disk are "added", "modified" or "unchanged"
  Object.keys(filesOnDisk).forEach(keyOnDisk => {
    const fileOnDisk = filesOnDisk[keyOnDisk];
    const objectInBucket = objectsInBucket[keyOnDisk];

    if (!objectInBucket) {
      diff[keyOnDisk] = 'A';
      return;
    }

    if (objectInBucket.hash !== fileOnDisk.hash || forceUpload) {
      diff[keyOnDisk] = 'M';
      return;
    }

    diff[keyOnDisk] = null;
    return;
  });

  //calculate whether files on disk are "deleted"
  Object.keys(objectsInBucket).forEach(keyInBucket => {
    const objectInBucket = objectsInBucket[keyInBucket];
    const fileOnDisk = filesOnDisk[keyInBucket];

    if (!fileOnDisk) {
      diff[keyInBucket] = 'D';
      return;
    }
  });

  return diff;
};
