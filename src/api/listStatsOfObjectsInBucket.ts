import {Group, ObjectStatsMap} from './types';
import * as AWS from 'aws-sdk';
import {match} from './match';

async function listObjectsInGroup(
  s3: AWS.S3,
  bucket: string,
  group: Group
): Promise<ObjectStatsMap> {
  const {prefix, include, exclude} = group;

  const output = await s3
    .listObjectsV2({
      Bucket: bucket,
      Prefix: prefix
    })
    .promise();

  //TODO: handle pagination
  if (output.IsTruncated) {
    throw new Error(
      'satay: Too many objects returned and pagination is not supported yet.'
    );
  }

  // check the bucket contains objects
  if (!output.Contents) {
    return {};
  }

  const filter = match({include, exclude});
  const map: ObjectStatsMap = {};
  output.Contents.filter(object => {
    // check the object has a key
    if (!object.Key) {
      return false;
    }

    // check the object exists in the same path (because "static" also returns results for "staticxx")
    if (prefix && !object.Key.startsWith(`${prefix}/`)) {
      return false;
    }

    // check the object is included in the group
    return filter(object.Key);
  }).forEach(object => {
    // check the object has a key
    if (!object.Key) {
      return;
    }

    map[object.Key] = {
      hash: object.ETag ? object.ETag.replace(/"([a-zA-Z0-9]+)"/, '$1') : '',
      size: object.Size ? object.Size : 0
    };
  });
  return map;
}

export async function listStatsOfObjectsInBucket(
  s3: AWS.S3,
  bucket: string,
  groups: Group[]
): Promise<ObjectStatsMap> {
  const maps = await Promise.all(
    groups.map(group => listObjectsInGroup(s3, bucket, group))
  );
  return maps.reduce((flattened, map) => {
    // check if any objects appear in more than one group
    Object.keys(map).forEach(key => {
      if (flattened[key]) {
        throw new Error(`File "${key}" is matched by multiple groups.`);
      }
    });

    // flatten the map
    return {...flattened, ...map};
  }, {});
}
