
export type FileFilter = (key: string) => boolean;

export type Group = {|
  source?: string;
  include?: RegExp | FileFilter;
  exclude?: RegExp | FileFilter;
  params?: object;
|};

export type Groups = Array<Group>;

export type File = {|
  path?: string,
  hash: string,
  params?: object
|};

export type FileMap = {
  [key: string]: File;
};

export type Object = {|
  hash: string;
|};

export type ObjectMap = {
  [key: string]: Object;
};

export type FileStatus = null | 'A' | 'M' | 'D';

export type FileStatuses = {
  [key: string]: FileStatus;
};
