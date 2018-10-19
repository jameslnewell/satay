import * as path from 'path';
import {calcETag} from './calcETag';

const fixtureDirectory = (fileName: string) =>
  path.join(__dirname, '..', '..', 'test', '__fixtures__', fileName);

describe('calcETag()', () => {
  it('should resolve when the file exists', () => {
    const etag = calcETag(fixtureDirectory('landscape.jpg'));
    return expect(etag).resolves.toEqual('52259ccd585da8f5820e7062efb7a029');
  });

  it('should reject when the file does not exist', () => {
    const etag = calcETag(fixtureDirectory('NonExistentFileOrDirectory'));
    return expect(etag).rejects.toEqual(
      expect.objectContaining({
        message: expect.stringContaining('no such file or directory')
      })
    );
  });
});
