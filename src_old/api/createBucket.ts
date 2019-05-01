import * as AWS from 'aws-sdk';

export async function createBucket(s3: AWS.S3, bucket: string) {
  await s3.createBucket({Bucket: bucket}).promise();
  await s3.waitFor('bucketExists', {Bucket: bucket}).promise();
}
