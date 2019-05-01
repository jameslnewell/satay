import * as path from 'path';
import {calcETag} from './calcETag';

const fixtureDirectory = (fileName: string) =>
  path.join(__dirname, '..', '..', 'test', '__fixtures__', 'website', fileName);

describe('calcETag()', () => {
  it('should resolve when the file exists', () => {
    const etag = calcETag(
      fixtureDirectory('static/files/atlassian-logo.bda8c743.svg')
    );
    return expect(etag).resolves.toEqual('bda8c743459a7a6939caa7ddcd1a770e');
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
