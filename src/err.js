const chalk = require('chalk');

module.exports = (msg, error) => {
  console.log();
  console.log(chalk.red(`  ❌  ${msg}:\n\n       ${error.message}`));
  console.log();
  process.exit(1);
};
