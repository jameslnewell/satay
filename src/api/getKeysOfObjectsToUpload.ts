import {ObjectDiffStatusMap, ObjectDiffStatus} from './types';

export function getKeysOfObjectsToUpload(
  diff: ObjectDiffStatusMap,
  shouldUploadUnmodifiedObjects?: boolean
): string[] {
  return Object.keys(diff).reduce<string[]>((accum, key) => {
    if (
      diff[key] === ObjectDiffStatus.ADDED ||
      diff[key] === ObjectDiffStatus.MODIFIED ||
      (diff[key] === ObjectDiffStatus.UNMODIFIED &&
        shouldUploadUnmodifiedObjects)
    ) {
      return [...accum, key];
    } else {
      return accum;
    }
  }, []);
}
