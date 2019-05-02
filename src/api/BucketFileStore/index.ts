import {S3} from 'aws-sdk';
import {FileStore, FileStoreListOptions} from '../FileStore';
import {FileMap} from '../FileMap';
import {listFiles} from './listFiles';
// import {createBucket} from './createBucket';
// import {configureBucket} from './configureBucket';

export interface BucketFileStoreOptions {
  s3?: S3;
  bucket: string;
  policy?: string;
  website?: string;
}

export class BucketFileStore implements FileStore {
  private s3: S3;
  private bucket: string;

  constructor(options: BucketFileStoreOptions) {
    this.s3 = options.s3 || new S3();
    this.bucket = options.bucket;
  }

  async uri() {
    return `https://${this.bucket}.s3-website-${
      this.s3.config.region
    }.amazonaws.com/`;
  }

  async create(): Promise<void> {
    // await createBucket(s3, bucket);
    // await configureBucket(s3, bucket, {policy, website});
  }

  async list(options: FileStoreListOptions = {}): Promise<FileMap> {
    return listFiles(this.s3, this.bucket, options);
  }

  async put(map: FileMap): Promise<void> {
    throw new Error('Not implemented yet.');
  }

  async delete(map: FileMap): Promise<void> {
    throw new Error('Not implemented yet.');
  }
}
