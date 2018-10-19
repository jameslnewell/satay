export async function getBucketURL(s3: AWS.S3, bucket: string, key?: string) {
  // LocationConstraint returns an empty string
  // @see https://github.com/aws/aws-sdk-js/issues/1937
  const {LocationConstraint: region} = await s3
    .getBucketLocation({Bucket: bucket})
    .promise();
  return `http://${bucket}.s3-website-${region ||
    'us-east-1'}.amazonaws.com/${key || ''}`;
}
