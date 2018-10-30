import * as path from 'path';
import satay from '../src/api';

describe('satay', () => {
  jest.setTimeout(10000);

  it.skip('should upload files', async () => {
    const emitter = satay('jameslnewell.me', [
      {source: path.join(__dirname, './__fixtures__')}
    ]);
  });
});
