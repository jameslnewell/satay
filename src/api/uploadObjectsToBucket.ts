import * as fs from 'fs';
import * as AWS from 'aws-sdk';
import * as mime from 'mime-types';
import {
  ObjectStatsMap,
  FileObjectStats,
  ObjectParamsMap,
  ObjectDiffStatus
} from './types';
import {Emitter} from './Emitter';

// FIXME: ManagedUpload.SendData _does_ include a VersionId, AWS types need to be fixed.
type SendDataWithVersion = AWS.S3.ManagedUpload.SendData & {VersionId?: string};

export async function uploadObjectsToBucket(
  s3: AWS.S3,
  bucket: string,
  statsOfObjectsToUpload: ObjectStatsMap<FileObjectStats>,
  paramsOfObjectsToUpload: ObjectParamsMap = {},
  emitter: Emitter
) {
  await Promise.all(
    Object.keys(statsOfObjectsToUpload).map(async keyOfObjectToUpload => {
      emitter.emit('object:upload', keyOfObjectToUpload, {
        progress: 0,
        status: ObjectDiffStatus.ADDED
      });
      const statsOfObjectToUpload = statsOfObjectsToUpload[keyOfObjectToUpload];
      const {VersionId} = (await s3
        .upload({
          ContentType: mime.lookup(statsOfObjectToUpload.path) || undefined,
          ACL: 'public-read',
          ...paramsOfObjectsToUpload[keyOfObjectToUpload],
          Bucket: bucket,
          Key: keyOfObjectToUpload,
          Body: fs.createReadStream(statsOfObjectToUpload.path)
        })
        .promise()) as SendDataWithVersion;
      emitter.emit('object:upload', keyOfObjectToUpload, {
        progress: 100,
        version: VersionId,
        status: ObjectDiffStatus.ADDED
      });
    })
  ); // TODO: listen for and emit progress events (httpUploadProgress) https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3/ManagedUpload.html
}
