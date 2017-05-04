//@flow weak
const chalk = require('chalk');
const err = require('./err');
const Bucket = require('./Bucket');
const calcDiff = require('./calcDiff');
const listFilesOnDisk = require('./listFilesOnDisk');
const listObjectsInBucket = require('./listObjectsInBucket');

const info = msg => console.log(chalk.cyan(`  • ${msg}`));

const ok = msg => {
  console.log();
  console.log(chalk.green(`  🎉  ${msg}`));
  console.log();
};

/**
 * @param   string  bucket
 * @param   array   groups
 * @param   object  options
 * @param   string  [options.region]
 * @param   object  [options.policy]
 * @param   object  [options.websiteConfig]
 * @param   string  [options.forceUpload]
 * @returns {Promise}
 */
module.exports = async function(bucket, groups, options) {
  options = options || {};

  const b = new Bucket(bucket, {region: options.region});

  //TODO: verify bucket configuration is a website and publically accessible

  //list the files on the disk
  let filesOnDisk = [];
  try {
    filesOnDisk = await listFilesOnDisk(groups);
  } catch (diskError) {
    err('Unable to list files on disk', diskError);
    return;
  }

  //list the objects in the bucket
  let objectsInBucket = [];
  try {
    objectsInBucket = await listObjectsInBucket(b);
  } catch (listError) {

    //exit due to an unrecoverable error
    if (!listError || listError.code !== 'NoSuchBucket') {
      err('Unable to list files in bucket', listError);
      return;
    }

    //attempt to create the bucket
    try {
      await b.create();
      console.log();
      info('Bucket created');
    } catch(createBucketError) {
      err('Unable to create bucket', createBucketError);
      return;
    }

    //attempt to configure the bucket
    try {
      await Promise.all([
        b.configureWebsite(),
        b.configurePolicy()
      ]);
      info('Bucket configured');
    } catch(configureBucketError) {
      err('Unable to configure bucket', configureBucketError);
      return;
    }

  }

  //calculate the diff
  const diff = calcDiff(filesOnDisk, objectsInBucket, options.forceUpload);

  //attempt to upload files
  const keysToUpload = Object.keys(diff).filter(key => diff[key] === 'A' || diff[key] === 'M');
  try {
    await Promise.all(keysToUpload.map(keyToUpload => {
      const file = filesOnDisk[keyToUpload];
      return b.upload(file.path, keyToUpload, file.params);
    }));
  } catch (uploadError) {
    err('Unable to upload files to bucket', uploadError);
    return;
  }

  //attempt to delete unused files
  const keysToDelete = Object.keys(diff).filter(key => diff[key] === 'D');
  try {
    await Promise.all(keysToDelete.map(keyToDelete => b.delete(keyToDelete)));
  } catch (deleteError) {
    err('Unable to delete unused files from bucket', deleteError);
    return;
  }

  //print the diff
  console.log();
  Object.keys(diff).sort().forEach(key => {
    if (!diff[key]) {
      console.log(`     ${key}`);
    } else {
      console.log(chalk.bold(`  ${diff[key]}  ${key}`));
    }
  });

  ok('Upload complete.');
  console.log(`  🔗  ${chalk.blue(chalk.underline(b.url()))}`);
  console.log();

};