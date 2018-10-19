#!/usr/bin/env node
/* tslint:disable: no-console no-var-requires */

// allow the `aws-sdk` to load configuration from file
process.env.AWS_SDK_LOAD_CONFIG = '1';

import * as path from 'path';
import * as yargs from 'yargs';
import chalk from 'chalk';
import satay, {Options, Group} from '../api';

interface Config extends Options {
  bucket: string;
  groups: Group[];
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

satay(bucket, relativeGroups, options).then(
  ({url, diff, bucketWasCreated, bucketWasConfigured}) => {
    if (bucketWasCreated) {
      console.log(chalk.cyan(`  • 'Bucket created'`));
    }

    if (bucketWasConfigured) {
      console.log(chalk.cyan(`  • 'Bucket configured'`));
    }

    // print the diff
    console.log();
    Object.keys(diff)
      .sort()
      .forEach(key => {
        if (!diff[key]) {
          console.log(`     ${key}`);
        } else {
          console.log(chalk.bold(`  ${diff[key]}  ${key}`));
        }
      });

    console.log();
    console.log(chalk.green(`  🎉  Upload complete.`));
    console.log();

    console.log(`  🔗  ${chalk.blue(chalk.underline(url))}`);
    console.log();
  },
  (error: Error) => {
    console.log();
    console.log(chalk.red(`  ❌  ${error.message}:\n\n       ${error.stack}`));
    console.log();
    process.exitCode = 1;
  }
);
