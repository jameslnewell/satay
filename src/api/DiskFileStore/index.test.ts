import {DiskFileStore} from './index';

describe('DiskFileStore', () => {
  describe('.list()', () => {
    it('should list files', async () => {
      const store = new DiskFileStore();
      const files = await store.list({include: 'src/**'});
      console.log(files);
    });
  });
});
