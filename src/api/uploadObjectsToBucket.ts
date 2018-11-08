import * as fs from 'fs';
import * as AWS from 'aws-sdk';
import * as mime from 'mime-types';
import {ObjectStatsMap, FileObjectStats, ObjectParamsMap} from './types';
import {Emitter} from './Emitter';

interface SendData extends AWS.S3.ManagedUpload.SendData {
  VersionId?: string;
}

export async function uploadObjectsToBucket(
  s3: AWS.S3,
  bucket: string,
  statsOfObjectsToUpload: ObjectStatsMap<FileObjectStats>,
  paramsOfObjectsToUpload: ObjectParamsMap = {},
  emitter: Emitter
) {
  await Promise.all(
    Object.keys(statsOfObjectsToUpload).map(async keyOfObjectToUpload => {
      const statsOfObjectToUpload = statsOfObjectsToUpload[keyOfObjectToUpload];

      // emit the first object:upload event
      emitter.emit('object:upload', keyOfObjectToUpload, {
        hash: statsOfObjectToUpload.hash,
        size: statsOfObjectToUpload.size,
        progress: 0,
        version: undefined
      });

      const {VersionId} = await new Promise<SendData>((resolve, reject) => {
        s3.upload({
          ContentType: mime.lookup(statsOfObjectToUpload.path) || undefined,
          ACL: 'public-read',
          ...paramsOfObjectsToUpload[keyOfObjectToUpload],
          Bucket: bucket,
          Key: keyOfObjectToUpload,
          Body: fs.createReadStream(statsOfObjectToUpload.path)
        })
          .on('httpUploadProgress', progress => {
            // delay the final object:upload event until we have the file metedata
            if (progress.loaded !== progress.total) {
              emitter.emit('object:upload', keyOfObjectToUpload, {
                hash: statsOfObjectToUpload.hash,
                size: statsOfObjectToUpload.size,
                progress: (progress.loaded / progress.total) * 100,
                version: undefined
              });
            }
          })
          .send((error, data) => {
            if (error) {
              reject(error);
            } else {
              resolve(data);
            }
          });
      });

      // emit the final object:upload event
      emitter.emit('object:upload', keyOfObjectToUpload, {
        hash: statsOfObjectToUpload.hash,
        size: statsOfObjectToUpload.size,
        progress: 100,
        version: VersionId
      });
    })
  );
}
