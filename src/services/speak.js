import chalk from 'chalk';

export const successColor = (msg) => chalk.green(msg + '\n');

export const errorColor = (msg) => chalk.red(msg + '\n');

export const warnColor = (msg) => chalk.yellow(msg + '\n');

export const infoColor = (msg) => chalk.blue(msg + '\n');

export const success = (msg) => console.log(successColor(msg));

export const error = (msg) => console.log(errorColor(msg));

export const normal = (msg) => console.log(msg);

export const json = (msg) => console.log(msg, null, 2);

export const warn = (msg) => console.log(warnColor(msg));

export const info = (msg) => console.log(infoColor(msg));
