import {getKeysOfObjectsToDelete} from './getKeysOfObjectsToDelete';
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

describe('getKeysOfObjectsToDelete()', () => {
  it('should return deleted keys', () => {
    expect(getKeysOfObjectsToDelete(diff, true)).toEqual(['file-e', 'file-f']);
  });

  it('should return added, modified and unmodified keys', () => {
    expect(getKeysOfObjectsToDelete(diff, false)).toEqual([]);
  });
});
