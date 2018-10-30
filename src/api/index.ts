import * as AWS from 'aws-sdk';
import {VError} from 'verror';
import {Group, Options, ObjectStatsMap, FileObjectStats} from './types';
import {Emitter} from './Emitter';
import {createBucket} from './createBucket';
import {configureBucket} from './configureBucket';
import {listStatsOfObjectsOnDisk} from './listStatsOfObjectsOnDisk';
import {listStatsOfObjectsInBucket} from './listStatsOfObjectsInBucket';
import {calcDiff} from './calcDiff';
import {getKeysOfObjectsToUpload} from './getKeysOfObjectsToUpload';
import {getStatsOfObjectsToUpload} from './getStatsOfObjectsToUpload';
import {getParamsOfObjectsToUpload} from './getParamsOfObjectsToUpload';
import {uploadObjectsToBucket} from './uploadObjectsToBucket';
import {getKeysOfObjectsToDelete} from './getKeysOfObjectsToDelete';
import {deleteObjectsFromBucket} from './deleteObjectsFromBucket';
import {getBucketURL} from './getBucketURL';
export * from './types';

export default function(
  bucket: string,
  groups: Group[],
  options: Options = {}
): Emitter {
  const s3 = new AWS.S3();
  const emitter = new Emitter();
  const {
    policy,
    website,
    shouldCreateBucket = true,
    shouldConfigureBucket = true,
    shouldUploadUnmodifiedObjects = false,
    shouldDeleteDeletedObjects = true
  } = options;

  setImmediate(async () => {
    if (groups.length === 0) {
      emitter.emit('error', new VError('No files for upload.'));
      return;
    }

    // list files on disk
    let statsOfObjectsOnDisk: ObjectStatsMap<FileObjectStats> = {};
    try {
      statsOfObjectsOnDisk = await listStatsOfObjectsOnDisk(groups);
    } catch (listDiskError) {
      emitter.emit(
        'error',
        new VError(listDiskError, 'Unable to list files on disk')
      );
      return;
    }

    // list files in the bucket
    let statsOfObjectsInBucket: ObjectStatsMap = {};
    try {
      statsOfObjectsInBucket = await listStatsOfObjectsInBucket(
        s3,
        bucket,
        groups
      );
    } catch (listBucketError) {
      if (!listBucketError || listBucketError.code !== 'NoSuchBucket') {
        emitter.emit(
          'error',
          new VError(listBucketError, 'Unable to list files in bucket')
        );
        return;
      }
      if (shouldCreateBucket) {
        try {
          await createBucket(s3, bucket);
          emitter.emit('bucket:created');
        } catch (createBucketError) {
          emitter.emit(
            'error',
            new VError(createBucketError, 'Unable to create bucket')
          );
          return;
        }
        if (shouldConfigureBucket) {
          try {
            await configureBucket(s3, bucket, {policy, website});
            emitter.emit('bucket:configured');
          } catch (configureBucketError) {
            emitter.emit(
              'error',
              new VError(configureBucketError, 'Unable to configure bucket')
            );
            return;
          }
        }
      } else {
        throw listBucketError;
      }
    }

    // get the bucket URL
    try {
      const bucketURL = await getBucketURL(s3, bucket);
      emitter.emit('url', {url: bucketURL});
    } catch (describeError) {
      emitter.emit(
        'error',
        new VError(describeError, 'Unable to get bucket region')
      );
      return;
    }

    // diff the objects on disk and the objects in the bucket
    const diff = calcDiff(statsOfObjectsOnDisk, statsOfObjectsInBucket);
    emitter.emit('diff', {diff});

    // upload objects to the bucket
    const keysOfObjectsToUpload = getKeysOfObjectsToUpload(
      diff,
      shouldUploadUnmodifiedObjects
    );
    const statsOfObjectsToUpload = getStatsOfObjectsToUpload(
      keysOfObjectsToUpload,
      statsOfObjectsOnDisk
    );
    const paramsOfObjectsToUpload = getParamsOfObjectsToUpload(
      keysOfObjectsToUpload,
      groups
    );
    if (Object.keys(statsOfObjectsToUpload).length) {
      try {
        await uploadObjectsToBucket(
          s3,
          bucket,
          statsOfObjectsToUpload,
          paramsOfObjectsToUpload
        );
      } catch (uploadError) {
        emitter.emit(
          'error',
          new VError(uploadError, 'Unable to upload files to bucket')
        );
        return;
      }
    }

    // delete objects from the bucket
    const keysOfObjectsToDelete = getKeysOfObjectsToDelete(
      diff,
      shouldDeleteDeletedObjects
    );
    if (keysOfObjectsToDelete.length) {
      try {
        await deleteObjectsFromBucket(s3, bucket, keysOfObjectsToDelete);
      } catch (uploadError) {
        emitter.emit(
          'error',
          new VError(uploadError, 'Unable to delete files from bucket')
        );
        return;
      }
    }

    emitter.emit('done');
  });

  return emitter;
}
