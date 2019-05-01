import {FileMap} from './FileMap';
import {FileDiffMap} from './FileDiffMap';
import {FileDiff} from './FileDiff';

export function compareFileMaps(
  sourceFileMap: FileMap,
  destinationFileMap: FileMap
): FileDiffMap {
  const diff: FileDiffMap = {};

  // calculate whether files on disk are "added", "modified" or "unchanged"
  Object.keys(sourceFileMap).forEach(keyOnDisk => {
    const fileOnDisk = sourceFileMap[keyOnDisk];
    const objectInBucket = destinationFileMap[keyOnDisk];

    if (!objectInBucket) {
      diff[keyOnDisk] = FileDiff.ADDED;
      return;
    }

    if (objectInBucket.hash !== fileOnDisk.hash) {
      diff[keyOnDisk] = FileDiff.MODIFIED;
      return;
    }

    diff[keyOnDisk] = FileDiff.UNMODIFIED;
    return;
  });

  // calculate whether files on disk are "deleted"
  Object.keys(destinationFileMap).forEach(keyInBucket => {
    const fileOnDisk = sourceFileMap[keyInBucket];
    if (!fileOnDisk) {
      diff[keyInBucket] = FileDiff.DELETED;
      return;
    }
  });

  return diff;
}
