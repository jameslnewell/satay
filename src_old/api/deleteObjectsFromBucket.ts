import * as AWS from 'aws-sdk';
import {Emitter} from './Emitter';

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
      progress: 0
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
  if (!Deleted) {
    return;
  }
  Deleted.forEach(deletedObject => {
    if (!deletedObject || !deletedObject.Key) {
      return;
    }
    emitter.emit('object:delete', deletedObject.Key, {
      progress: 100,
      version: deletedObject.VersionId
    });
  });
}
