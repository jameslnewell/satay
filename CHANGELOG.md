# Change log

## 2.X.X

- rewritten in `typescript`
- changed how `prefix` is handled - not just prefixed but only those files on the bucket are compared

### CLI

- load config from the AWS CLI confg files
- removed `--force-upload`

### API

- renamed `forceUpload` to `shouldUploadUnmodifiedObjects`
- renamed `websiteConfig` to `website`
- removed `region` to rely on AWS configuration instead
- changed the `satay` API to no longer output to the console, instead it returns an emitter
- added `shouldCreateBucket`
- added `shouldConfigureBucket`
- added `shouldDeleteDeletedObjects`

## 1.1.6

- fixed file permissions to be public
- fixed doco to mention content-type and acl params

## 1.1.5

- fix badge links

## 1.1.4

- updated the demo video

## 1.1.3

- add missing `babel-runtime` dependency

## 1.1.2

- run build and tests before publishing

## 1.1.1

- fixed some documentation
- fixed the ordering of deleted files in the diff
- refactored the internals a little bit
- added a few types
- added a few tests
- added prettier

## 1.1.0

- transpile with babel to support Node >= v4
