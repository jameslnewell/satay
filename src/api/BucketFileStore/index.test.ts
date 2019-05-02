import * as AWS from 'aws-sdk';
import {BucketFileStore} from './index';

AWS.config.region = 'ap-southeast-2';

describe('BucketFileStore', () => {
  describe('.uri()', () => {
    it('should', async () => {
      const store = new BucketFileStore({bucket: 'jameslnewell.me'});
      console.log(await store.uri());
    });
  });

  describe('.list()', () => {
    jest.setTimeout(200000);
    it('should list files', async () => {
      const store = new BucketFileStore({
        bucket: 'platform-static-development'
      });
      const files = await store.list({
        directory:
          'fa2dde4c9724d7fd8ad92f0621568d0e/e444f73956e5b2a401eb9471db89e7c9',
        include: '**/*.js'
      });
      console.log(files);
      throw new Error();
    });
  });
});
