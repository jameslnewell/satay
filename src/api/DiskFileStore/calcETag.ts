import * as fs from 'fs';
import * as crypto from 'crypto';

export function calcETag(file: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const fd = fs.createReadStream(file);
    const hash = crypto.createHash('md5').setEncoding('hex');

    fd.on('end', () => {
      hash.end();
      resolve(hash.read().toString());
    }).on('error', error => {
      reject(error);
    });

    fd.pipe(hash);
  });
}
