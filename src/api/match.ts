import {Minimatch} from 'minimatch';

export type Filter = string | RegExp | ((key: string) => boolean);

export interface MatchOptions {
  include?: Filter;
  exclude?: Filter;
}

export function m(pattern: Filter): ((key: string) => boolean) {
  if (typeof pattern === 'string') {
    const glob = new Minimatch(pattern);
    return key => glob.match(key);
  } else if (pattern instanceof RegExp) {
    return key => pattern.test(key);
  } else {
    return key => pattern(key);
  }
}

export function match(options: MatchOptions): ((key: string) => boolean) {
  const includeFunction = m(options.include || (() => true));
  const excludeFunction = m(options.exclude || (() => false));
  return (key: string) => {
    if (!includeFunction(key)) {
      return false;
    }

    if (excludeFunction(key)) {
      return false;
    }

    return true;
  };
}
