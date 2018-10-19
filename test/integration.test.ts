import * as path from 'path';
import {satay} from '../src/api';

describe('satay', () => {
  jest.setTimeout(10000);

  it('should upload files', async () => {
    const result = await satay({
      directory: path.join(__dirname, './__fixtures__'),
      bucket: 'platform-static-development'
    });
    console.log('RESULT', result);
  });
});
