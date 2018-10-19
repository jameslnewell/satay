import * as AWS from 'aws-sdk';
import {VError} from 'verror';
import {Group, Options, Output, ObjectStatsMap, FileObjectStats} from './types';
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

export default async function(
  bucket: string,
  groups: Group[],
  options: Options = {}
): Promise<Output> {
  const s3 = new AWS.S3();
  const {
    policy,
    website,
    shouldCreateBucket = true,
    shouldConfigureBucket = true,
    shouldUploadUnmodifiedObjects = false,
    shouldDeleteDeletedObjects = true
  } = options;
  let bucketWasCreated: boolean = false;
  let bucketWasConfigured: boolean = false;

  if (groups.length === 0) {
    throw new VError('No files for upload.');
  }

  // list files on disk
  let statsOfObjectsOnDisk: ObjectStatsMap<FileObjectStats> = {};
  try {
    statsOfObjectsOnDisk = await listStatsOfObjectsOnDisk(groups);
  } catch (listDiskError) {
    throw new VError(listDiskError, 'Unable to list files on disk');
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
      throw new VError(listBucketError, 'Unable to list files in bucket');
    }
    if (shouldCreateBucket) {
      try {
        await createBucket(s3, bucket);
        bucketWasCreated = true;
      } catch (createBucketError) {
        throw new VError(createBucketError, 'Unable to create bucket');
      }
      if (shouldConfigureBucket) {
        try {
          await configureBucket(s3, bucket, {policy, website});
          bucketWasConfigured = true;
        } catch (configureBucketError) {
          throw new VError(configureBucketError, 'Unable to configure bucket');
        }
      }
    } else {
      throw listBucketError;
    }
  }

  // diff the objects on disk and the objects in the bucket
  const diff = calcDiff(statsOfObjectsOnDisk, statsOfObjectsInBucket);

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
      throw new VError(uploadError, 'Unable to upload files to bucket');
    }
  }

  // delete objects from the bucket
  const keysOfObjectsToDelete = getKeysOfObjectsToDelete(diff);
  if (shouldDeleteDeletedObjects && keysOfObjectsToDelete.length) {
    try {
      await deleteObjectsFromBucket(s3, bucket, keysOfObjectsToDelete);
    } catch (uploadError) {
      throw new VError(uploadError, 'Unable to delete files from bucket');
    }
  }

  // get the bucket URL
  let bucketURL: string;
  try {
    bucketURL = await getBucketURL(s3, bucket);
  } catch (describeError) {
    throw new VError(describeError, 'Unable to get bucket region');
  }

  return {
    url: bucketURL,
    diff,
    bucketWasCreated,
    bucketWasConfigured
  };
}
