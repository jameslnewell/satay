import * as AWS from 'aws-sdk';
import {Emitter} from './Emitter';
import {ObjectStatsMap} from './types';

export async function deleteObjectsFromBucket(
  s3: AWS.S3,
  bucket: string,
  statsOfObjectsToDelete: ObjectStatsMap,
  emitter: Emitter
): Promise<void> {
  if (Object.keys(statsOfObjectsToDelete).length > 1000) {
    throw new Error(
      'satay: Too many objects to delete and multiple calls are not supported yet. Please submit a PR 😀'
    );
  }

  // emit the first object:delete event
  Object.keys(statsOfObjectsToDelete).forEach(keyOfObjectToDelete => {
    emitter.emit('object:delete', keyOfObjectToDelete, {
      ...statsOfObjectsToDelete[keyOfObjectToDelete],
      progress: 0,
      version: undefined
    });
  });

  const {Deleted} = await s3
    .deleteObjects({
      Bucket: bucket,
      Delete: {
        Objects: Object.keys(statsOfObjectsToDelete).map(
          keyOfObjectToDelete => ({
            Key: keyOfObjectToDelete
          })
        )
      }
    })
    .promise();

  if (!Deleted) {
    return;
  }

  // emit the final object:delete event
  Deleted.forEach(deletedObject => {
    if (!deletedObject || !deletedObject.Key) {
      return;
    }
    emitter.emit('object:delete', deletedObject.Key, {
      ...statsOfObjectsToDelete[deletedObject.Key],
      progress: 100,
      version: deletedObject.VersionId
    });
  });
}
