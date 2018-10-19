import * as AWS from 'aws-sdk';
import * as AWSMock from 'aws-sdk-mock';
import {getBucketURL} from './getBucketURL';

AWSMock.setSDKInstance(AWS);

describe('getBucketURL()', () => {
  afterEach(() => AWSMock.restore());

  it('should return a URL when there is a key', async () => {
    AWSMock.mock(
      'S3',
      'getBucketLocation',
      (p, cb) =>
        console.log(p) ||
        cb(null, {
          LocationConstraint: 'ap-southeast-2'
        })
    );

    const s3 = new AWS.S3();
    expect(await getBucketURL(s3, 'jameslnewell.me', 'index.html')).toEqual(
      'http://jameslnewell.me.s3-website-ap-southeast-2.amazonaws.com/index.html'
    );
  });

  it('should return a URL when there is no key', async () => {
    AWSMock.mock('S3', 'getBucketLocation', {
      LocationConstraint: 'ap-southeast-2'
    });

    const s3 = new AWS.S3();
    expect(await getBucketURL(s3, 'jameslnewell.me')).toEqual(
      'http://jameslnewell.me.s3-website-ap-southeast-2.amazonaws.com/'
    );
  });

  it('should return a URL when there is no location', async () => {
    AWSMock.mock('S3', 'getBucketLocation', {
      LocationConstraint: ''
    });

    const s3 = new AWS.S3();
    expect(await getBucketURL(s3, 'jameslnewell.me')).toEqual(
      'http://jameslnewell.me.s3-website-us-east-1.amazonaws.com/'
    );
  });
});
