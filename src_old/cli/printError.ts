/* tslint:disable: no-console */
import chalk from 'chalk';

export function printError(message: string, stack?: string) {
  console.error();
  console.error(
    chalk.red(`  ❌  ${message}${stack && `:\n\n       ${stack}`}`)
  );
  process.exitCode = 1;
}
