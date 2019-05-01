import {FileMap} from './FileMap';

export interface FileStore {
  url(): Promise<string>;

  create(): Promise<void>;

  list(): Promise<FileMap>;

  upload(map: FileMap): Promise<void>;

  delete(map: FileMap): Promise<void>;
}
