import {Group, ObjectParamsMap} from './types';
import {match} from './match';

export function getParamsOfObjectsToUpload(
  keysOfObjectsToUpload: string[],
  groups: Group[]
): ObjectParamsMap {
  return keysOfObjectsToUpload.reduce((accum, key) => {
    const group = groups.find(({include, exclude}) =>
      match({include, exclude})(key)
    );
    if (group) {
      return {
        ...accum,
        [key]: group.params
      };
    } else {
      return accum;
    }
  }, {});
}
