import * as AWS from 'aws-sdk';
import {FileMap} from '../FileMap';
import {FileStoreListOptions} from '../FileStore';
import {match} from '../utils/match';

export async function listFiles(
  s3: AWS.S3,
  bucket: string,
  options: FileStoreListOptions
): Promise<FileMap> {
  const {directory, include, exclude} = options;

  const map: FileMap = {};
  let continuationToken;
  do {
    const output = await s3
      .listObjectsV2({
        Bucket: bucket,
        Prefix: directory,
        ContinuationToken: continuationToken
      })
      .promise();

    continuationToken = output.NextContinuationToken;

    // check the bucket contains objects
    if (!output.Contents) {
      continue;
    }

    const filter = match({include, exclude});
    output.Contents.forEach(object => {
      // check the object has a key
      if (!object.Key) {
        return;
      }

      // check the object exists in the same path (because "static" also returns results for "staticxx")
      if (directory && !object.Key.startsWith(`${directory}/`)) {
        return;
      }

      // check the object is included in the group
      if (!filter(object.Key)) {
        return;
      }

      const name = directory ? object.Key.substr(directory.length) : object.Key;
      console.log(object);
      map[name] = {
        name,
        hash: object.ETag ? object.ETag.replace(/"([a-zA-Z0-9]+)"/, '$1') : '',
        size: object.Size ? object.Size : 0,
        params: {}, // TODO:
        getStream: () => {
          throw new Error('Not implemented yet');
        }
      };
    });
  } while (continuationToken);

  return map;
}
