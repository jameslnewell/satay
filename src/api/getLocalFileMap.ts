import {FileStore} from './FileStore';
import {FileGroup} from './FileGroup';
import {FileMap} from './FileMap';

export async function getLocalFileMap(
  store: FileStore,
  groups: FileGroup[]
): Promise<FileMap> {
  const map: FileMap = {};
  await Promise.all(
    groups.map(async group => {
      const {source, include, exclude} = group;
      const files = await store.list({
        directory: source,
        include,
        exclude
      });
      files.forEach(file => {
        if (map[file.name]) {
          throw new Error(`File "${file.name}" is matched by multiple groups.`);
        }
        // TODO: check for double ups
        map[file.name] = file;
        // mapA = prefixMap(mapA, group.prefix)
        // mapA = paramsMap(mapA, group.params)
      });
    })
  );
  return map;
}
