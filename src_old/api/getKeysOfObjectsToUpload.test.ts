import {getKeysOfObjectsToUpload} from './getKeysOfObjectsToUpload';
import {ObjectDiffStatus} from './types';

const diff = {
  'file-a': ObjectDiffStatus.ADDED,
  'file-b': ObjectDiffStatus.UNMODIFIED,
  'file-c': ObjectDiffStatus.ADDED,
  'file-d': ObjectDiffStatus.MODIFIED,
  'file-e': ObjectDiffStatus.DELETED,
  'file-f': ObjectDiffStatus.DELETED,
  'file-g': ObjectDiffStatus.MODIFIED,
  'file-h': ObjectDiffStatus.UNMODIFIED
};

describe('getKeysOfObjectsToUpload()', () => {
  it('should return added and modified keys', () => {
    expect(getKeysOfObjectsToUpload(diff, false)).toEqual([
      'file-a',
      'file-c',
      'file-d',
      'file-g'
    ]);
  });

  it('should return added, modified and unmodified keys', () => {
    expect(getKeysOfObjectsToUpload(diff, true)).toEqual([
      'file-a',
      'file-b',
      'file-c',
      'file-d',
      'file-g',
      'file-h'
    ]);
  });
});
