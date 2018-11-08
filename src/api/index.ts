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
import {getStatsOfObjectsToDelete} from './getStatsOfObjectsToDelete';
import {deleteObjectsFromBucket} from './deleteObjectsFromBucket';
import {getBucketURL} from './getBucketURL';
import {getKeysOfObjectsToDelete} from './getKeysOfObjectsToDelete';
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
      emitter.emit(
        'error',
        new VError('No groups of files specified for upload.')
      );
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
          new VError(listBucketError, 'Unable to list files in the bucket')
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
            new VError(createBucketError, 'Unable to create the bucket')
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
              new VError(configureBucketError, 'Unable to configure the bucket')
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
        new VError(describeError, 'Unable to get the bucket region')
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
          paramsOfObjectsToUpload,
          emitter
        );
      } catch (uploadError) {
        emitter.emit(
          'error',
          new VError(uploadError, 'Unable to upload files to the bucket')
        );
        return;
      }
    }

    // delete objects from the bucket
    const keysOfObjectsToDelete = getKeysOfObjectsToDelete(
      diff,
      shouldDeleteDeletedObjects
    );
    const statsOfObjectsToDelete = getStatsOfObjectsToDelete(
      keysOfObjectsToDelete,
      statsOfObjectsInBucket
    );
    if (Object.keys(statsOfObjectsToDelete).length) {
      try {
        await deleteObjectsFromBucket(
          s3,
          bucket,
          statsOfObjectsToDelete,
          emitter
        );
      } catch (uploadError) {
        emitter.emit(
          'error',
          new VError(uploadError, 'Unable to delete files from the bucket')
        );
        return;
      }
    }

    emitter.emit('done');
  });

  return emitter;
}
