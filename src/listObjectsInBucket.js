//@flow
import type {ObjectMap} from './types';
import Bucket from './Bucket';

module.exports = async function(b: Bucket): Promise<ObjectMap> {
  const objects = await b.list();

  const objectsInBucket = {};
  objects.forEach(object => {
    objectsInBucket[object.Key] = {
      hash: object.ETag.replace(/"([a-zA-Z0-9]+)"/, '$1')
    };
  });

  return objectsInBucket;
};
