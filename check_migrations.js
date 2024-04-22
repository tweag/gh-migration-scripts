import fs from 'fs';
import path from 'path';

// Default values
const defaultLogFile = 'check_migrations.log';
const defaultLogDirectory = process.cwd();

// Function to log messages
const log = (message) => {
  const timestamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
  const logMessage = `[${timestamp}] ${message}`;

  fs.appendFileSync(logOptions.logFile, `${logMessage}\n`);
  console.log(logMessage);
};

// Function to print usage
const printUsage = () => {
  console.log('Usage: node script.js [-d [log_directory]] [-l [log_file]]');
  console.log('This script checks the downloaded migration log files to see which ones completed successfully and how long the migration took.');
  console.log('-d [log_directory] Directory containing log files (optional, default: current working directory)');
  console.log('-l [log_file] Log file path (optional, default: check_migrations.log)');
};

// Parse command-line arguments
const logOptions = {
  logFile: defaultLogFile,
  logDirectory: defaultLogDirectory,
};

const args = process.argv.slice(2);

for (let i = 0; i < args.length; i++) {
  if (args[i] === '-d') {
    logOptions.logDirectory = args[++i];
  } else if (args[i] === '-l') {
    logOptions.logFile = args[++i];
  } else if (args[i] === '-h') {
    printUsage();
    process.exit(0);
  } else {
    console.error(`Invalid argument: ${args[i]}`);
    printUsage();
    process.exit(1);
  }
}

// Check if log files directory exists
if (!fs.existsSync(logOptions.logDirectory)) {
  log(`Error: Directory '${logOptions.logDirectory}' not found.`);
  printUsage();
  process.exit(1);
}

// Get log files in the directory
const logFiles = fs.readdirSync(logOptions.logDirectory).filter((file) => file.startsWith('migration-log-') && file.endsWith('.log'));

if (logFiles.length === 0) {
  log(`Error: No migration log files found in the directory '${logOptions.logDirectory}'.`);
  printUsage();
  process.exit(1);
}

log(`Checking migration logs in '${logOptions.logDirectory}' for completion status...`);
// Count the number of migrations started
const migrationStartedCount = logFiles.reduce((count, file) => {
  const content = fs.readFileSync(path.join(logOptions.logDirectory, file), 'utf8');
  const matches = content.match(/Migration started/g) || [];
  return count + matches.length;
}, 0);

if (migrationStartedCount === 0) {
  log('Error: No migrations started found in the log files.');
  process.exit(1);
}

// Count the number of migrations completed
const migrationCompletedCount = logFiles.reduce((count, file) => {
  const content = fs.readFileSync(path.join(logOptions.logDirectory, file), 'utf8');
  const matches = content.match(/Migration complete/g) || [];
  return count + matches.length;
}, 0);

log(`${migrationCompletedCount}/${migrationStartedCount} migrations completed.`);

if (migrationStartedCount !== migrationCompletedCount) {
  log('Error: Not all migrations completed.');
  process.exit(1);
}

log('Checking migration duration...');

// Get the start and end times of the migration
const migrationStartedTimes = [];
const migrationEndedTimes = [];

logFiles.forEach((file) => {
  const content = fs.readFileSync(path.join(logOptions.logDirectory, file), 'utf8');
  const startedMatches = content.match(/\[(.*)\] INFO -- Migration started/g) || [];
  const endedMatches = content.match(/\[(.*)\] INFO -- Migration complete/g) || [];

  migrationStartedTimes.push(...startedMatches.map((match) => match.slice(1, 20)));
  migrationEndedTimes.push(...endedMatches.map((match) => match.slice(1, 20)));
});

const migrationStartedTime = migrationStartedTimes.sort()[0];
const migrationEndedTime = migrationEndedTimes.sort().slice(-1)[0];

if (!migrationStartedTime || !migrationEndedTime) {
  log('Error: Unable to determine migration start or end time.');
  process.exit(1);
}

log(`Migration started at ${migrationStartedTime} and ended at ${migrationEndedTime}`);
