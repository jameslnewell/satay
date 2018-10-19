import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';
import finder from 'finder-on-steroids';
import {Group, ObjectStatsMap, FileObjectStats} from './types';
import {calcETag} from './calcETag';

const getFileStats = util.promisify(fs.stat);

/**
 * Get stats for a single object on disk
 * @param file The full file path
 */
async function getObjectStats(file: string): Promise<FileObjectStats> {
  const [etag, stat] = await Promise.all([calcETag(file), getFileStats(file)]);
  return {
    path: file,
    hash: etag,
    size: stat.size
  };
}

/**
 * Get stats for all objects on disk at the source location
 * @param group
 */
async function listObjectsInGroup(
  group: Group
): Promise<ObjectStatsMap<FileObjectStats>> {
  const {source = '.', include, exclude, prefix} = group;
  const f = finder(source);
  if (include) {
    f.include(include);
  }
  if (exclude) {
    f.exclude(exclude);
  }
  const keys = await f.files().find();
  const map: ObjectStatsMap<FileObjectStats> = {};
  await Promise.all(
    keys.map(async key => {
      map[prefix ? path.join(prefix, key) : key] = await getObjectStats(
        path.join(source, key)
      );
    })
  );
  return map;
}

// TODO: use a promise queue
/**
 * Get stats for all objects on disk at all the source locations
 * @param groups
 */
export async function listStatsOfObjectsOnDisk(
  groups: Group[]
): Promise<ObjectStatsMap<FileObjectStats>> {
  const maps = await Promise.all(
    groups.map(group => listObjectsInGroup(group))
  );
  return maps.reduce((flattened, map) => {
    // check if any objects appear in more than one group
    Object.keys(map).forEach(key => {
      if (flattened[key]) {
        new Error(`File "${key}" is matched by multiple groups.`);
      }
    });

    // flatten the map
    return {...flattened, ...map};
  }, {});
}
