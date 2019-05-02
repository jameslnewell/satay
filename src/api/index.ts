import {FileStore} from './FileStore';
import {BucketFileStore} from './BucketFileStore';
import {DiskFileStore} from './DiskFileStore';
import {compareFileMaps} from './compareFileMaps';
import {filterToUpload} from './filterToUpload';
import {filterToDelete} from './filterToDelete';

export interface Options {
  source: FileStore;
  destination: FileStore;

  shouldCreateStore?: boolean;
  shouldDeleteDeletedFiles?: boolean;
  shouldUploadUnmodifiedFiles?: boolean;
}

export default async function(options: Options) {
  const {
    source,
    destination,
    shouldCreateStore,
    shouldDeleteDeletedFiles,
    shouldUploadUnmodifiedFiles
  } = options;
  const sourceFileStore = source;
  const destinationFileStore = destination;

  if (shouldCreateStore) {
    await destinationFileStore.create();
  }

  const [sourceFileMap, destinationFileMap] = await Promise.all([
    sourceFileStore.list(),
    destinationFileStore.list()
  ]);
  const diff = compareFileMaps(sourceFileMap, destinationFileMap);

  await destinationFileStore.put(filterToUpload(diff, sourceFileMap)); // TODO: shouldUploadUnmodifiedFiles

  if (shouldDeleteDeletedFiles) {
    await destinationFileStore.delete(filterToDelete(diff, destinationFileMap));
  }

  return {
    uri: await destinationFileStore.uri()
  };
}
