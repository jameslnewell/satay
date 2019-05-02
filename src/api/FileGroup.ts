export interface FileGroup {
  source?: string;
  /**
   * A prefix for the destination
   * e.g. prefix=foo file=abc.jpg => foo/abc.jpg
   */
  prefix?: string;
  include?: string | RegExp | ((path: string) => boolean);
  exclude?: string | RegExp | ((path: string) => boolean);
  params?: {};
}
