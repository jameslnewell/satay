#!/usr/bin/env node
/* tslint:disable: no-console no-var-requires */

// allow the `aws-sdk` to load configuration from file
process.env.AWS_SDK_LOAD_CONFIG = '1';

import * as path from 'path';
import * as yargs from 'yargs';
import chalk from 'chalk';
import satay, {Options, Group, ObjectDiffStatus} from '../api';

interface Config extends Options {
  bucket: string;
  groups: Group[];
}

function isStatusActioned(status: ObjectDiffStatus, options: Options) {
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

const argv = yargs.help().options({
  config: {
    default: undefined,
    requiresArg: true
  }
}).argv;

const configFile = argv.config
  ? path.resolve(argv.config)
  : path.resolve('satay.config.js');

// try and load the config file
let config: Config;
try {
  config = require(configFile);
} catch (error) {
  console.log();
  console.log(
    chalk.red(`  ❌  Unable to load config file:\n\n       ${error.stack}`)
  );
  console.log();
  process.exit(1);
}

// assert the config file is an object
if (typeof config !== 'object') {
  console.log();
  console.log(chalk.red(`  ❌  "${configFile}" file must export an object.`));
  console.log();
  process.exit(1);
}

const {bucket, groups, ...options} = config;

// resolve groups relative to the config directory
const configDirectory = path.dirname(configFile);
const relativeGroups = groups.map(group =>
  Object.assign({}, group, {
    source: path.resolve(configDirectory, group.source)
  })
);

let bucketURL: string;
satay(bucket, relativeGroups, options)
  .on('bucket:created', () => console.log(chalk.cyan(`  • Bucket created`)))
  .on('bucket:configured', () =>
    console.log(chalk.cyan(`  • Bucket configured`))
  )
  .on('url', ({url}) => (bucketURL = url))
  .on('diff', ({diff}) => {
    console.log();
    Object.keys(diff)
      .sort()
      .forEach(key => {
        const status = diff[key];
        if (isStatusActioned(status, options)) {
          console.log(chalk.bold(`   ${status || ' '}  ${key}`));
        } else {
          console.log(`   ${status || ' '}  ${key}`);
        }
      });
  })
  .on('done', () => {
    console.log();
    console.log(chalk.green(`  🎉  Upload complete.`));
    console.log();

    console.log(`  🔗  ${chalk.blue(chalk.underline(bucketURL))}`);
    console.log();
  })
  .on('error', error => {
    console.error();
    console.error(
      chalk.red(`  ❌  ${error.message}:\n\n       ${error.stack}`)
    );
    console.error(error);
    process.exitCode = 1;
  });
