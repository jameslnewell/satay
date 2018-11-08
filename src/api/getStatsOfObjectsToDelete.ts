import {ObjectStatsMap} from './types';

export function getStatsOfObjectsToDelete(
  keysOfObjectsToDelete: string[],
  statsOfObjectsInBucket: ObjectStatsMap
): ObjectStatsMap {
  return keysOfObjectsToDelete.reduce((accum, key) => {
    return {
      ...accum,
      [key]: statsOfObjectsInBucket[key]
    };
  }, {});
}
