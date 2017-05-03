#!/usr/bin/env node
require('dotenv').config();
const path = require('path');
const chalk = require('chalk');
const minimist = require('minimist');
const omit = require('lodash.omit');
const satay = require('..');

const argv = minimist(process.argv.slice(2));
const configFile = argv.config ? path.resolve(argv.config) : path.resolve('satay.config.js');
const configDirectory = path.dirname(configFile);

//try and read the config file
let config = null;
try {
  config = require(configFile);
} catch(error) {
  console.log(chalk.red(`Unable to load config file "${configFile}": ${error}`));
  process.exit(1);
}

//assert the config file is an object
if (typeof config !== 'object') {
  console.log(chalk.red(`Config is expected to be an object.`));
  process.exit(1);
}

const bucket = config.bucket;

//resolve groups relative to the config directory
const groups = config.groups.map(group => Object.assign({}, group, {
  source: path.resolve(configDirectory, group.source)
}));

const options = Object.assign(omit(config, ['bucket', 'groups']));

if (argv['force-upload']) {
  options.forceUpload = true;
}

satay(bucket, groups, options);
