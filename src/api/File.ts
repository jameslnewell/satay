import {Readable} from 'stream';

export interface File {
  name: string;
  hash: string;
  size: number;
  params: {[name: string]: string};
  getStream(): Readable;
}
