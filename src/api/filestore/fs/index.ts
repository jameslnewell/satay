import {FileStore} from '../../FileStore';
import {FileMap} from '../../FileMap';

export class FileSystemFileStore implements FileStore {
  async url() {
    return '';
  }

  async create(): Promise<void> {
    throw new Error('Not implemented yet.');
  }

  async list(): Promise<FileMap> {
    return {};
  }

  async upload(map: FileMap): Promise<void> {
    throw new Error('Not implemented yet.');
  }

  async delete(map: FileMap): Promise<void> {
    throw new Error('Not implemented yet.');
  }
}
