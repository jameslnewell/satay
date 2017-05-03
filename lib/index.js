const chalk = require('chalk');
const err = require('./err');
const Bucket = require('./Bucket');
const listFilesOnDisk = require('./listFilesOnDisk');
const calcFilesToUpload = require('./calcFilesToUpload');
const calcKeysToDelete = require('./calcKeysToDelete');

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

  let filesOnDisk = [];
  try {
    filesOnDisk = await listFilesOnDisk(groups);
  } catch (diskError) {
    err('Unable to list files on disk', diskError);
    return;
  }

  let objectsInBucket = [];
  try {
    objectsInBucket = await b.list();
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

  //calculate example to upload
  let filesToUpload = [];
  try {
    filesToUpload = await calcFilesToUpload(filesOnDisk, objectsInBucket, options.forceUpload);
  } catch (diskError) {
    err('Unable to calculate checksum', diskError);
    return;
  }

  //attempt to upload example
  try {
    await Promise.all(filesToUpload.map(file => b.upload(file.path, file.key, file.params)));
  } catch (uploadError) {
    err('Unable to upload files to bucket', uploadError);
    return;
  }

  //attempt to delete unused example
  let keysToDelete = [];
  try {
    keysToDelete = calcKeysToDelete(filesOnDisk, objectsInBucket);
    await Promise.all(keysToDelete.map(key => b.delete(key)));
  } catch (deleteError) {
    err('Unable to delete unused files from bucket', deleteError);
    return;
  }

  //print the diff
  console.log();
  filesOnDisk.forEach(fileOnDisk => {
    const uploaded = filesToUpload.find(fileToUpload => fileToUpload.key === fileOnDisk.key);
    const existed = objectsInBucket.find(objectInBucket => objectInBucket.Key === fileOnDisk.key);
    if (uploaded && existed) {
      console.log(chalk.bold(`  M  ${fileOnDisk.key}`))
    } else if (uploaded) {
      console.log(chalk.bold(`  A  ${fileOnDisk.key}`))
    } else {
      console.log(`     ${fileOnDisk.key}`)
    }
  });
  keysToDelete.forEach(keyToDelete => console.log(chalk.bold(`  D  ${keyToDelete}`))); //TODO: order deleted in with other files

  ok('Upload complete.');
  console.log(`  🔗  ${chalk.blue(chalk.underline(b.url()))}`);
  console.log();

};