import {ObjectDiffStatusMap, ObjectDiffStatus} from './types';

export function getKeysOfObjectsToDelete(diff: ObjectDiffStatusMap): string[] {
  return Object.keys(diff).reduce((accum, key) => {
    if (diff[key] === ObjectDiffStatus.DELETED) {
      accum = [...accum, key];
    }
    return accum;
  }, []);
}
