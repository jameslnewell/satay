import * as path from 'path';
import satay from '../src/api';

describe.skip('integration', () => {
  jest.setTimeout(30000);

  it('should upload files', async done => {
    // jameslnewell.me
    const emitter = satay(
      'satay-test',
      [{source: path.join(__dirname, './__fixtures__/website/static')}],
      {shouldUploadUnmodifiedObjects: false}
    );

    emitter
      // .on('bucket:created', () => console.log('bucket created '))
      // .on('bucket:configured', () => console.log('bucket configured'))
      // .on('diff', ({diff}) => console.log('diff', diff))
      // .on('object:upload', (key, event) => console.log('upload', key, event))
      .on('object:delete', (key, event) => console.log('delete', key, event))
      .on('done', () => done())
      .on('error', error => done.fail(error));
  });
});
