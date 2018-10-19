import {ObjectStatsMap, FileObjectStats} from './types';

export function getStatsOfObjectsToUpload(
  keysOfObjectsToUpload: string[],
  statsOfObjectsOnDisk: ObjectStatsMap<FileObjectStats>
): ObjectStatsMap<FileObjectStats> {
  return keysOfObjectsToUpload.reduce((accum, key) => {
    return {
      ...accum,
      [key]: statsOfObjectsOnDisk[key]
    };
  }, {});
}
