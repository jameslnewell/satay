#!/usr/bin/env node
/* tslint:disable: no-console no-var-requires */

// allow the `aws-sdk` to load configuration from file
process.env.AWS_SDK_LOAD_CONFIG = '1';

import * as path from 'path';
import * as yargs from 'yargs';
import chalk from 'chalk';
import satay, {Options, Group} from '../api';
import {printError} from './printError';
import {isUploadedOrDeleted} from './isUploadedOrDeleted';

interface Config extends Options {
  bucket: string;
  groups: Group[];
}

(() => {
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
  let config: Config | undefined;
  try {
    config = require(configFile);
  } catch (error) {
    printError(`"Unable to load config file ${configFile}"`, error.stack);
    return;
  }

  // assert the config file is an object
  if (typeof config !== 'object') {
    printError(`"${configFile}" file must export an object.`);
    return;
  }

  const {bucket, groups, ...options} = config;

  // resolve groups relative to the config directory
  const configDirectory = path.dirname(configFile);
  const relativeGroups = groups.map(group =>
    Object.assign({}, group, {
      source: path.resolve(configDirectory, group.source || '.')
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
          if (isUploadedOrDeleted(status, options)) {
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
      printError(error.message, error.stack);
    });
})();
