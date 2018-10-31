import {getParamsOfObjectsToUpload} from './getParamsOfObjectsToUpload';

describe('getParamsOfObjectsToUpload()', () => {
  it('should get params for keys', () => {
    expect(
      getParamsOfObjectsToUpload(
        ['abc/index.html', 'abc/profile.png', 'abc/index.json'],
        [
          {
            include: '**/*.html',
            params: {
              CacheControl: 'max-age=123, public'
            }
          },
          {
            include: '**/*.png',
            params: {
              CacheControl: 'max-age=456, public'
            }
          }
        ]
      )
    ).toEqual({
      'abc/index.html': {
        CacheControl: 'max-age=123, public'
      },
      'abc/profile.png': {
        CacheControl: 'max-age=456, public'
      }
    });
  });
});
