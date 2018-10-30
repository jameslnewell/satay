import {ObjectStatsMap, ObjectDiffStatusMap, ObjectDiffStatus} from './types';

export function calcDiff(
  objectStatsMap1: ObjectStatsMap,
  objectStatsMap2: ObjectStatsMap
): ObjectDiffStatusMap {
  const diff: ObjectDiffStatusMap = {};

  // calculate whether files on disk are "added", "modified" or "unchanged"
  Object.keys(objectStatsMap1).forEach(keyOnDisk => {
    const fileOnDisk = objectStatsMap1[keyOnDisk];
    const objectInBucket = objectStatsMap2[keyOnDisk];

    if (!objectInBucket) {
      diff[keyOnDisk] = ObjectDiffStatus.ADDED;
      return;
    }

    if (objectInBucket.hash !== fileOnDisk.hash) {
      diff[keyOnDisk] = ObjectDiffStatus.MODIFIED;
      return;
    }

    diff[keyOnDisk] = ObjectDiffStatus.UNMODIFIED;
    return;
  });

  // calculate whether files on disk are "deleted"
  Object.keys(objectStatsMap2).forEach(keyInBucket => {
    const fileOnDisk = objectStatsMap1[keyInBucket];

    if (!fileOnDisk) {
      diff[keyInBucket] = ObjectDiffStatus.DELETED;
      return;
    }
  });

  return diff;
}
