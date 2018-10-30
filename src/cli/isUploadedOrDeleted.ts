import {ObjectDiffStatus, Options} from '../api';

export function isUploadedOrDeleted(
  status: ObjectDiffStatus,
  options: Options
) {
  if (
    status === ObjectDiffStatus.ADDED ||
    status === ObjectDiffStatus.MODIFIED
  ) {
    return true;
  }

  if (
    status === ObjectDiffStatus.UNMODIFIED &&
    options.shouldUploadUnmodifiedObjects
  ) {
    return true;
  }

  if (
    status === ObjectDiffStatus.DELETED &&
    (options.shouldDeleteDeletedObjects === undefined ||
      options.shouldDeleteDeletedObjects === true)
  ) {
    return true;
  }

  return false;
}
