import * as AWS from 'aws-sdk';

export interface ObjectStats {
  hash: string;
  size: number;
}

export interface FileObjectStats extends ObjectStats {
  path: string;
}

export interface ObjectStatsMap<T extends ObjectStats = ObjectStats> {
  [key: string]: T;
}

export enum ObjectDiffStatus {
  UNMODIFIED = '',
  ADDED = 'A',
  MODIFIED = 'M',
  DELETED = 'D'
}

export interface ObjectDiffStatusMap {
  [key: string]: ObjectDiffStatus;
}

export type ObjectParams = Partial<AWS.S3.PutObjectRequest>;

export interface ObjectParamsMap {
  [key: string]: ObjectParams;
}

export type Filter = string | RegExp | ((key: string) => boolean);

export interface Group {
  source?: string;
  include?: Filter;
  exclude?: Filter;
  prefix?: string;
  params?: ObjectParams;
}

export interface Options {
  policy?: {};
  website?: {};
  shouldCreateBucket?: boolean;
  shouldConfigureBucket?: boolean;
  shouldDeleteDeletedObjects?: boolean;
  shouldUploadUnmodifiedObjects?: boolean;
}
