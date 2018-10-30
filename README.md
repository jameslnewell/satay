# satay

[![satay](https://img.shields.io/npm/v/satay.svg)](https://www.npmjs.com/package/satay)
[![Travis](https://img.shields.io/travis/jameslnewell/satay.svg)](https://travis-ci.org/jameslnewell/satay)

A utility for uploading static sites to AWS S3.

[<img src="https://asciinema.org/a/4k2xeld8239ece83ln31s6qk7.png" width="80%"/>](https://asciinema.org/a/4k2xeld8239ece83ln31s6qk7)

## Usage

### Using the CLI

1. Install `satay` globally:

   ```bash
   $ npm install -g satay
   ```

2. Create a configuration file:

   `satay.config.js`

   ```js
   module.exports = {
     bucket: 'jameslnewell.me',

     groups: [
       {
         source: './static',
         include: /\.html$/
       },

       //cache finger-printed assets for up to 1 year
       {
         source: './static',
         exclude: /\.html$/,
         params: {
           CacheControl: `max-age=${60 * 60 * 24 * 365.25}, public`
         }
       }
     ]
   };
   ```

3. Configure your [AWS credentials](http://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/configuring-the-jssdk.html)

4. Run `satay`
   ```bash
   $ satay
   ```

### Using the API

1. Install `satay` locally:

   ```bash
   $ npm install --save-dev satay
   ```

2. Create a script file:

   `upload.js`

   ```js
   import satay from 'satay';

   satay(
     'jameslnewell.me',
     [
       {
         source: './static',
         include: /\.html$/
       },

       //cache finger-printed assets for up to 1 year
       {
         source: './static',
         exclude: /\.html$/,
         params: {
           CacheControl: `max-age=${60 * 60 * 24 * 365.25}, public`
         }
       }
     ],
     {
       shouldUploadUnmodifiedObjects: true
     }
   );
   ```

3. Configure your [AWS credentials](http://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/configuring-the-jssdk.html)

4. Run `upload.js`
   ```bash
   $ node upload.js
   ```

## CLI

```bash
$ satay --config=satay.config.js
```

**Flags:**

- `--config` - _Optional_. The configuration file name. Defaults to `satay.config.js` in the current working directory.

### Configuration

**Properties:**

- `bucket` - _Optional_. A `string`. The name of the bucket.
- `groups` - _Required_. An `array` of file groupings.
  - `source` - _Optional_. A `string`. The directory that will be searched. Defaults to `process.cwd()`.
  - `include` - _Optional_. A `RegExp` or `function`. A regular expression or function to filter which files are included.
  - `exclude` - _Optional_. A `RegExp` or `function`. A regular expression or function to filter which files are excluded.
  - `prefix` - _Optional_. A `string`. The prefix that will be prepended to the object key. Defaults to `""`.
  - `params` - _Optional_. An `object`. The additional parameters to pass to `S3.putObject()`. Defaults to `{ContentType: mime.lookup(filename), ACL: 'public-read'}`.
- `policy` - _Optional_. An `object`. The AWS policy. Defaults to public read access for all files.
- `website` - _Optional_. An `object`. The AWS website configuration. Uses `index.html` as the default `IndexDocument` and `404.html` as the default `ErrorDocument`.
- `shouldCreateBucket` - _Optional_. A `boolean`. Whether the bucket should be created if it doesn't exist.
- `shouldConfigureBucket` - _Optional_. A `boolean`. Whether the bucket should be configured as a public website if it doesn't exist.
- `shouldUploadUnmodifiedObjects` - _Optional_. A `boolean`. Whether the unmodified files on disk should be uploaded even though they are the same as the files in the bucket.
- `shouldDeleteDeletedObjects` - _Optional_. A `boolean`. Whether the objects in the bucket should be deleted when the files are deleted from disk.

## API

```ts
satay(bucket: String, groups: Array<Group>, options: Object): Promise
```

**Parameters:**

- `bucket` - _Optional_. A `string`. The name of the bucket.
- `groups` - _Required_. An `array` of file groupings.
  - `source` - _Optional_. A `string`. The directory that will be searched. Defaults to `process.cwd()`.
  - `include` - _Optional_. A `RegExp` or `function`. A regular expression or function to filter which files are included.
  - `exclude` - _Optional_. A `RegExp` or `function`. A regular expression or function to filter which files are excluded.
  - `prefix` - _Optional_. A `string`. The prefix that will be prepended to the object key. Defaults to `""`.
  - `params` - _Optional_. An `object`. The additional parameters to pass to `S3.putObject()`. Defaults to `{ContentType: mime.lookup(filename), ACL: 'public-read'}`.
- `options` - _Optional_. An `object`. Additional options.
  - `policy` - _Optional_. An `object`. The AWS policy. Defaults to public read access for all files.
  - `website` - _Optional_. An `object`. The AWS website configuration. Uses `index.html` as the default `IndexDocument` and `404.html` as the default `ErrorDocument`.
  - `shouldCreateBucket` - _Optional_. A `boolean`. Whether the bucket should be created if it doesn't exist.
  - `shouldConfigureBucket` - _Optional_. A `boolean`. Whether the bucket should be configured as a public website if it doesn't exist.
  - `shouldUploadUnmodifiedObjects` - _Optional_. A `boolean`. Whether the unmodified files on disk should be uploaded even though they are the same as the files in the bucket.
  - `shouldDeleteDeletedObjects` - _Optional_. A `boolean`. Whether the objects in the bucket should be deleted when the files are deleted from disk.

## Change log

[Change log](https://github.com/jameslnewell/satay/blob/master/CHANGELOG.md)
