const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');
const mime = require('mime-types');
const omit = require('lodash.omit');

const noop = () => {
  /* do nothing */
};

class Bucket {
  /**
   * @param string  bucket
   * @param object  [options]
   * @param string  [options.region]
   * @param object  [options.policy]
   * @param object  [options.websiteConfig]
   */
  constructor(bucket, options) {
    this.bucket = bucket;
    this.options = options || {};

    this.s3 = new AWS.S3({
      region: this.options.region,
      params: {
        Bucket: this.bucket
      }
    });
  }

  /**
   * Get the bucket URL
   * @param   {string} [key]
   * @returns {string}
   */
  url(key) {
    return `http://${this.bucket}.s3-website-${this.options.region}.amazonaws.com/${key || ''}`;
  }

  /**
   * Create the bucket
   * @returns {Promise}
   */
  create() {
    return this.s3.createBucket().promise();
  }

  /**
   * Configure the bucket for public access
   * @returns {Promise}
   */
  configurePolicy() {
    const policy = this.options.policy || {
      Version: '2008-10-17',
      Statement: [
        {
          Sid: 'PublicReadGetObject',
          Effect: 'Allow',
          Principal: {AWS: '*'},
          Action: 's3:GetObject',
          Resource: `arn:aws:s3:::${this.bucket}/*`
        }
      ]
    };

    return this.s3.putBucketPolicy({Policy: JSON.stringify(policy)}).promise();
  }

  /**
   * Configure the bucket as a website
   * @returns {Promise}
   */
  configureWebsite() {
    //TODO: configure more options http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putBucketWebsite-property
    const websiteConfig = this.options.websiteConfig || {
      IndexDocument: {Suffix: 'index.html'},
      ErrorDocument: {Key: '404.html'}
    };

    return this.s3
      .putBucketWebsite({WebsiteConfiguration: websiteConfig})
      .promise();
  }

  /**
   * List all example in the bucket
   * @returns {Promise.<Array.<String>>}
   */
  list() {
    //TODO: handle pagination
    return this.s3.listObjectsV2().promise().then(res => res.Contents);
  }

  /**
   * Upload a file to the bucket
   * @param   string  file
   * @param   string  key
   * @param   object  [options]
   * @returns {Promise}
   */
  upload(file, key, options) {
    const params = Object.assign(
      {
        ContentType: mime.lookup(file)
      },
      omit(options, ['Bucket', 'Body', 'Key']),
      {
        Key: key,
        Body: fs.createReadStream(file)
      }
    );
    return this.s3.putObject(params).promise();
  }

  /**
   * Delete a file from the bucket
   * @param   string key
   * @returns {Promise}
   */
  delete(key) {
    return this.s3.deleteObject({Key: key}).promise();
  }
}

module.exports = Bucket;
