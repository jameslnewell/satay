import * as AWS from 'aws-sdk';

export async function deleteObjectsFromBucket(
  s3: AWS.S3,
  bucket: string,
  keysOfObjectsToDelete: string[]
): Promise<void> {
  if (keysOfObjectsToDelete.length > 1000) {
    throw new Error(
      'satay: Too many objects to delete and multiple calls are not supported yet. Please submit a PR 😀'
    );
  }
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
