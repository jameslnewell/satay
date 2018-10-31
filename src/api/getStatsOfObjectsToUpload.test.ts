import {getStatsOfObjectsToUpload} from './getStatsOfObjectsToUpload';

describe('getStatsOfObjectsToUpload()', () => {
  it('should get stats for keys', () => {
    expect(
      getStatsOfObjectsToUpload(['abc/index.html', 'abc/profile.png'], {
        'abc/index.html': {
          path: '',
          hash: 'abcdefg',
          size: 123
        },
        'abc/profile.png': {
          path: '',
          hash: 'hijklmn',
          size: 456
        },
        'abc/index.json': {
          path: '',
          hash: 'opqrstu',
          size: 789
        }
      })
    ).toEqual({
      'abc/index.html': {
        path: '',
        hash: 'abcdefg',
        size: 123
      },
      'abc/profile.png': {
        path: '',
        hash: 'hijklmn',
        size: 456
      }
    });
  });
});
