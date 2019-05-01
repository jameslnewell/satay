import * as AWS from 'aws-sdk';

async function putBucketPolicy(s3: AWS.S3, bucket: string, policy?: {}) {
  const params = policy || {
    Version: '2008-10-17',
    Statement: [
      {
        Sid: 'PublicReadGetObject',
        Effect: 'Allow',
        Principal: {AWS: '*'},
        Action: 's3:GetObject',
        Resource: `arn:aws:s3:::${bucket}/*`
      }
    ]
  };
  return s3
    .putBucketPolicy({
      Bucket: bucket,
      Policy: JSON.stringify(params)
    })
    .promise();
}

async function putBucketWebsite(
  s3: AWS.S3,
  bucket: string,
  website?: AWS.S3.WebsiteConfiguration
) {
  //TODO: configure more options http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putBucketWebsite-property
  return s3
    .putBucketWebsite({
      Bucket: bucket,
      WebsiteConfiguration: website || {
        IndexDocument: {Suffix: 'index.html'},
        ErrorDocument: {Key: '404.html'}
      }
    })
    .promise();
}

export interface ConfigureBucketOptions {
  policy?: {};
  website?: AWS.S3.WebsiteConfiguration;
}

export async function configureBucket(
  s3: AWS.S3,
  bucket: string,
  options: ConfigureBucketOptions
): Promise<void> {
  const {policy, website} = options;
  await Promise.all([
    putBucketPolicy(s3, bucket, policy),
    putBucketWebsite(s3, bucket, website)
  ]);
}
