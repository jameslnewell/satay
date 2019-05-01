import {FileStore} from '../../FileStore';
import {FileMap} from '../../FileMap';
import {createBucket} from './createBucket';
import {configureBucket} from './configureBucket';

export interface AmazonSimpleStorageFileStoreOptions {
  bucket: string;
  policy?: string;
  website?: string;
}

export class AmazonSimpleStorageFileStore implements FileStore {
  async url() {
    return '';
  }

  async create(): Promise<void> {
    await createBucket(s3, bucket);
    await configureBucket(s3, bucket, {policy, website});
    this.emit('created');
  }

  async list(): Promise<FileMap> {
    this.emit('listed');
    return {};
  }

  async upload(map: FileMap): Promise<void> {
    throw new Error('Not implemented yet.');
    this.emit('uploaded');
  }

  async delete(map: FileMap): Promise<void> {
    throw new Error('Not implemented yet.');
    this.emit('deleted');
  }
}
