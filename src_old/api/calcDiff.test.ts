import {calcDiff} from './calcDiff';
import {ObjectDiffStatus} from './types';

describe('calcDiff()', () => {
  it('should mark a file as added when the file is present on disk but is not present in the bucket', () => {
    const filesOnDisk = {'index.html': {hash: 'abcd', size: 1234}};
    const filesInBucket = {};

    const diff = calcDiff(filesOnDisk, filesInBucket);

    expect(diff).toMatchObject({
      'index.html': ObjectDiffStatus.ADDED
    });
  });

  it('should mark a file as modified when the file is present on disk and is present in the bucket and the hashes do not match', () => {
    const filesOnDisk = {'index.html': {hash: 'abcd', size: 1234}};
    const filesInBucket = {'index.html': {hash: 'efgh', size: 5678}};

    const diff = calcDiff(filesOnDisk, filesInBucket);

    expect(diff).toMatchObject({
      'index.html': ObjectDiffStatus.MODIFIED
    });
  });

  it('should not mark a file when the file is present on disk and is present in the bucket and the hashes do match', () => {
    const filesOnDisk = {'index.html': {hash: 'abcd', size: 1234}};
    const filesInBucket = {'index.html': {hash: 'abcd', size: 1234}};

    const diff = calcDiff(filesOnDisk, filesInBucket);

    expect(diff).toMatchObject({
      'index.html': ObjectDiffStatus.UNMODIFIED
    });
  });

  it('should mark a file as deleted when the file is not present on disk but is present in the bucket', () => {
    const filesOnDisk = {};
    const filesInBucket = {'index.html': {hash: 'abcd', size: 1234}};

    const diff = calcDiff(filesOnDisk, filesInBucket);

    expect(diff).toMatchObject({
      'index.html': ObjectDiffStatus.DELETED
    });
  });
});
