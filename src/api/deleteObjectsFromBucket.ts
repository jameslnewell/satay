import * as AWS from 'aws-sdk';
import {Emitter} from './Emitter';
import {ObjectDiffStatus} from './types';

export async function deleteObjectsFromBucket(
  s3: AWS.S3,
  bucket: string,
  keysOfObjectsToDelete: string[],
  emitter: Emitter
): Promise<void> {
  if (keysOfObjectsToDelete.length > 1000) {
    throw new Error(
      'satay: Too many objects to delete and multiple calls are not supported yet. Please submit a PR 😀'
    );
  }
  keysOfObjectsToDelete.forEach(key => {
    emitter.emit('object:delete', key, {
      progress: 0,
      status: ObjectDiffStatus.DELETED
    });
  });
  const {Deleted} = await s3
    .deleteObjects({
      Bucket: bucket,
      Delete: {
        Objects: keysOfObjectsToDelete.map(keyOfObjectToDelete => ({
          Key: keyOfObjectToDelete
        }))
      }
    })
    .promise();
  Deleted.forEach(({Key, VersionId}) => {
    emitter.emit('object:delete', Key, {
      progress: 100,
      version: VersionId,
      status: ObjectDiffStatus.DELETED
    });
  });
}
