# satay

[![satay](https://img.shields.io/npm/v/satay.svg)]() 
[![Travis](https://img.shields.io/travis/jameslnewell/satay.svg)]()

A utility for uploading static sites to AWS S3.

[<img src="https://asciinema.org/a/epn855cax1ppvciuhgx5bsbfr.png" alt="asciicast" width="60%"/>](https://asciinema.org/a/epn855cax1ppvciuhgx5bsbfr)

## Usage

### Using the CLI

1) Install `satay` globally:
    
    ```bash
    $ npm install -g satay
    ```

2) Create a configuration file:
    
    `satay.config.js`
    ```js
    module.exports = {

      bucket: 'jameslnewell.me',
      region: 'ap-southeast-2',
   
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
            CacheControl: `Cache-Control: max-age=${60*60*24*365.25}, public`
          }
        }

      ]
   
    };
    ```
3) Configure your [AWS credentials](http://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/configuring-the-jssdk.html)

4) Run `satay`
    
    ```bash
    $ satay
    ```

### Using the API

1) Install `satay` locally:
    
    ```bash
    $ npm install --save-dev satay
    ```

2) Create a script file:
    
    `upload.js`
    ```js
    const satay = require('satay');

    satay('jameslnewell.me', [

        {
          source: './static',
          include: /\.html$/
        },
    
        //cache finger-printed assets for up to 1 year
        {
          source: './static',
          exclude: /\.html$/,
          params: {
            CacheControl: `Cache-Control: max-age=${60*60*24*365.25}, public`
          }
        }

    ], {region: 'ap-southeast-2'});

    ```

3) Configure your [AWS credentials](http://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/configuring-the-jssdk.html)

4) Run `upload.js`
    
    ```bash
    $ node upload.js
    ```

## CLI

```bash
$ satay --config=satay.config.js --force-upload
```

**Flags:**

- `--config` - *Optional*. The configuration file name. Defaults to `satay.config.js` in the current working directory.
- `--force-upload` - *Optional*. Forces all files to be uploaded regardless of whether the files have been modified. Useful for applying new metadata.

### Configuration

**Properties:**

- `bucket` - *Optional*. A `string`. The name of the bucket.
- `region` - *Optional*. A `string`. The bucket region. Defaults to the region defined elsewhere by [AWS configuration](http://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/configuring-the-jssdk.html).
- `groups` - *Required*. An `array` of file groupings.
  - `source` - *Optional*. A `string`. The directory that will be searched. Defaults to `process.cwd()`.
  - `include` - *Optional*. A `RegExp` or `function`. A regular expression or function to filter which files are included.
  - `exclude` - *Optional*. A `RegExp` or `function`. A regular expression or function to filter which files are excluded.
  - `prefix` - *Optional*. A `string`. The prefix that will be prepended to the object key. Defaults to `""`.
  - `params` - *Optional*. An `object`. The additional parameters to pass to `S3.putObject()`. Defaults to `{}`.
- `policy` - *Optional*. An `object`. The AWS policy. Defaults to public read access for all files.
- `websiteConfig` - *Optional*. An `object`. The AWS website configuration. Uses `index.html` as the default `IndexDocument` and `404.html` as the default `ErrorDocument`.

## API

```ts
satay(bucket: String, groups: Array<Group>, options: Object): Promise
```
**Parameters:**

- `bucket` - *Optional*. A `string`. The name of the bucket.
- `groups` - *Required*. An `array` of file groupings.
  - `source` - *Optional*. A `string`. The directory that will be searched. Defaults to `process.cwd()`.
  - `include` - *Optional*. A `RegExp` or `function`. A regular expression or function to filter which files are included.
  - `exclude` - *Optional*. A `RegExp` or `function`. A regular expression or function to filter which files are excluded.
  - `prefix` - *Optional*. A `string`. The prefix that will be prepended to the object key. Defaults to `""`.
  - `params` - *Optional*. An `object`. The additional parameters to pass to `S3.putObject()`. Defaults to `{}`.
- `options` - *Optional*. An `object`. Additional options.
  - `region` - *Optional*. A `string`. The bucket region. Defaults to the region defined elsewhere by [AWS configuration](http://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/configuring-the-jssdk.html).
  - `policy` - *Optional*. An `object`. The AWS policy. Defaults to public read access for all files.
  - `websiteConfig` - *Optional*. An `object`. The AWS website configuration. Uses `index.html` as the default `IndexDocument` and `404.html` as the default `ErrorDocument`.

## Change log

[Change log](https://github.com/jameslnewell/satay/blob/master/CHANGELOG.md)
