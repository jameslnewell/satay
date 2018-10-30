import {ObjectDiffStatusMap, ObjectDiffStatus} from './types';

export function getKeysOfObjectsToDelete(
  diff: ObjectDiffStatusMap,
  shouldDeleteDeletedObjects: boolean
): string[] {
  if (!shouldDeleteDeletedObjects) {
    return [];
  }
  return Object.keys(diff).reduce<string[]>((accum, key) => {
    if (diff[key] === ObjectDiffStatus.DELETED) {
      accum = [...accum, key];
    }
    return accum;
  }, []);
}
