import {Group, ObjectStatsMap} from './types';
import * as AWS from 'aws-sdk';

async function listObjectsInGroup(
  s3: AWS.S3,
  bucket: string,
  group: Group
): Promise<ObjectStatsMap> {
  const output = await s3
    .listObjectsV2({
      Bucket: bucket,
      Prefix: group.prefix
    })
    .promise();

  //TODO: handle pagination
  if (output.IsTruncated) {
    throw new Error(
      'satay: Too many objects returned and pagination is not supported yet.'
    );
  }

  // TODO: filter by group include and exclude??
  const map: ObjectStatsMap = {};
  output.Contents.filter(object => Boolean(object.Key)).forEach(object => {
    map[object.Key] = {
      hash: object.ETag.replace(/"([a-zA-Z0-9]+)"/, '$1'),
      size: object.Size
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
        new Error(`File "${key}" is matched by multiple groups.`);
      }
    });

    // flatten the map
    return {...flattened, ...map};
  }, {});
}
