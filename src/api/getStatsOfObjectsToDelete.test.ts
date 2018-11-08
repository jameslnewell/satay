import {getStatsOfObjectsToDelete} from './getStatsOfObjectsToDelete';

describe('getStatsOfObjectsToDelete()', () => {
  it('should get stats for keys', () => {
    expect(
      getStatsOfObjectsToDelete(['abc/index.html', 'abc/profile.png'], {
        'abc/index.html': {
          hash: 'abcdefg',
          size: 123
        },
        'abc/profile.png': {
          hash: 'hijklmn',
          size: 456
        },
        'abc/index.json': {
          hash: 'opqrstu',
          size: 789
        }
      })
    ).toEqual({
      'abc/index.html': {
        hash: 'abcdefg',
        size: 123
      },
      'abc/profile.png': {
        hash: 'hijklmn',
        size: 456
      }
    });
  });
});
