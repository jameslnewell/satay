import {FileStore, FileStoreListOptions} from '../FileStore';
import {FileMap} from '../FileMap';
import {listFiles} from './listFiles';

export class DiskFileStore implements FileStore {
  async uri(): Promise<string> {
    throw new Error('Not implemented yet.');
  }

  async create(): Promise<void> {
    throw new Error('Not implemented yet.');
  }

  async list(options: FileStoreListOptions = {}): Promise<FileMap> {
    return listFiles(options);
  }

  async put(map: FileMap): Promise<void> {
    throw new Error('Not implemented yet.');
  }

  async delete(map: FileMap): Promise<void> {
    throw new Error('Not implemented yet.');
  }
}
