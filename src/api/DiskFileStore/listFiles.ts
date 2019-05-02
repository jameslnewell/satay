import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';
import createFinder from 'finder-on-steroids';
import {File} from '../File';
import {FileMap} from '../FileMap';
import {FileStoreListOptions} from '../FileStore';
import {calcETag} from './calcETag';

const getFileStats = util.promisify(fs.stat);

/**
 * Get stats for a single object on disk
 * @param file The full file path
 */
async function getFileInfo(file: string): Promise<File> {
  const [etag, stat] = await Promise.all([calcETag(file), getFileStats(file)]);
  return {
    name: file,
    hash: etag,
    size: stat.size,
    params: {},
    getStream: () => fs.createReadStream(file)
  };
}

/**
 * Get stats for all objects on disk at all the source locations
 * @param groups
 */
export async function listFiles(
  options: FileStoreListOptions
): Promise<FileMap> {
  const {directory = '.', include, exclude} = options;
  const finder = createFinder(directory);
  if (include) {
    finder.include(include);
  }
  if (exclude) {
    finder.exclude(exclude);
  }
  const filenames = await finder.files().find();
  const map: FileMap = {};
  await Promise.all(
    filenames.map(async filename => {
      map[filename] = await getFileInfo(path.join(directory, filename));
    })
  );
  return map;
}
