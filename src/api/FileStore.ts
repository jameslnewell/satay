import {File} from './File';
import {FileMap} from './FileMap';

export interface FileStoreListOptions {
  directory?: string;
  include?: string | RegExp | ((filename: string) => boolean);
  exclude?: string | RegExp | ((filename: string) => boolean);
}

export interface FileStore {
  /**
   * Get the URI representing the file store
   *  e.g. https://jameslnewell.com.s3-website-ap-southeast-2.amazonaws.com/
   *  e.g. file:///Users/jameslnewell/my-project/
   */
  uri(): Promise<string>;

  /**
   * Create the file store
   */
  create(): Promise<void>;

  /**
   * List files in the file store
   */
  list(options: FileStoreListOptions): Promise<File[]>;

  /**
   * Put a list of files in the file store
   * @param map
   */
  put(map: FileMap): Promise<void>;

  /**
   * Delete a list of files from the file store
   * @param map
   */
  delete(map: FileMap): Promise<void>;
}
