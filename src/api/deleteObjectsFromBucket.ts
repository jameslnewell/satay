import * as AWS from 'aws-sdk';

export async function deleteObjectsFromBucket(
  s3: AWS.S3,
  bucket: string,
  keysOfObjectsToDelete: string[]
): Promise<void> {
  // TODO: handle more than 1000 objects
  await s3
    .deleteObjects({
      Bucket: bucket,
      Delete: {
        Objects: keysOfObjectsToDelete.map(keyOfObjectToDelete => ({
          Key: keyOfObjectToDelete
        }))
      }
    })
    .promise();
}
