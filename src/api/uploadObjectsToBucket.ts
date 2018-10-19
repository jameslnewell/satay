import * as fs from 'fs';
import * as AWS from 'aws-sdk';
import * as mime from 'mime-types';
import {ObjectStatsMap, FileObjectStats, ObjectParamsMap} from './types';

export async function uploadObjectsToBucket(
  s3: AWS.S3,
  bucket: string,
  statsOfObjectsToUpload: ObjectStatsMap<FileObjectStats>,
  paramsOfObjectsToUpload: ObjectParamsMap = {}
) {
  await Promise.all(
    Object.keys(statsOfObjectsToUpload).map(keyOfObjectToUpload => {
      const statsOfObjectToUpload = statsOfObjectsToUpload[keyOfObjectToUpload];
      s3.upload({
        ContentType: mime.lookup(statsOfObjectToUpload.path) || undefined,
        ACL: 'public-read',
        ...paramsOfObjectsToUpload[keyOfObjectToUpload],
        Bucket: bucket,
        Key: keyOfObjectToUpload,
        Body: fs.createReadStream(statsOfObjectToUpload.path)
      }).promise();
    })
  );
}
