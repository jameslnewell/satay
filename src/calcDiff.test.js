//@flow
import calcDiff from './calcDiff';

describe('calcDiff()', () => {
  it('should mark a file as added when the file is present on disk but is not present in the bucket', () => {
    const filesOnDisk = {'index.html': {hash: 'abcd'}};
    const filesInBucket = [];

    const diff = calcDiff(filesOnDisk, filesInBucket);

    expect(diff).toMatchObject({
      'index.html': 'A'
    });
  });

  it('should mark a file as modified when the file is present on disk and present in the bucket and the hashes do not match', () => {
    const filesOnDisk = {'index.html': {hash: 'abcd'}};
    const filesInBucket = {'index.html': {hash: 'efgh'}};

    const diff = calcDiff(filesOnDisk, filesInBucket);

    expect(diff).toMatchObject({
      'index.html': 'M'
    });
  });

  it('should mark a file as modified when the file is present on disk and present in the bucket and the hashes do match', () => {
    const filesOnDisk = {'index.html': {hash: 'abcd'}};
    const filesInBucket = {'index.html': {hash: 'abcd'}};

    const diff = calcDiff(filesOnDisk, filesInBucket);

    expect(diff).toMatchObject({
      'index.html': null
    });
  });

  it('should mark a file as deleted when the file is not present on disk but is present in the bucket', () => {
    const filesOnDisk = [];
    const filesInBucket = {'index.html': {hash: 'abcd'}};

    const diff = calcDiff(filesOnDisk, filesInBucket);

    expect(diff).toMatchObject({
      'index.html': 'D'
    });
  });
});
