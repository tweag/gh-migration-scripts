#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Function to print usage
const printUsage = () => {
	console.log(
		'Usage: npx check-migrations [-d [log_directory]] [-l [log_file]]',
	);
	console.log(
		'This script checks the downloaded migration log files to see which ones completed successfully and how long the migration took.',
	);
	console.log(
		'-d [log_directory] Directory containing log files (optional, default: current working directory)',
	);
	console.log(
		'-l [log_file] Log file path (optional, default: check_migrations.log)',
	);
};

// Default values
let logOptions = {
	logFile: 'check_migrations.log',
	logDirectory: process.cwd(),
};

// Function to log messages
const log = (message) => {
	const timestamp = new Date()
		.toISOString()
		.replace(/T/, ' ')
		.replace(/\..+/, '');
	const logMessage = `[${timestamp}] ${message}`;

	fs.appendFileSync(logOptions.logFile, `${logMessage}\n`);
	console.log(logMessage);
};

// Parse command-line options
const args = process.argv.slice(2);

// Parse arguments
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
const logFiles = fs
	.readdirSync(logOptions.logDirectory)
	.filter((file) => file.startsWith('migration-log-') && file.endsWith('.log'));

if (logFiles.length === 0) {
	log(
		`Error: No migration log files found in the directory '${logOptions.logDirectory}'.`,
	);
	printUsage();
	process.exit(1);
}

log(
	`Checking migration logs in '${logOptions.logDirectory}' for completion status...`,
);

let migrationStartedCount = 0;
let migrationCompletedCount = 0;

// Count the number of migrations
logFiles.forEach((file) => {
	const content = fs.readFileSync(
		path.join(logOptions.logDirectory, file),
		'utf8',
	);

	// Count occurrences in each file
	migrationStartedCount += (content.match(/Migration started/g) || []).length;
	migrationCompletedCount += (content.match(/Migration complete/g) || [])
		.length;
});

log(
	`${migrationCompletedCount}/${migrationStartedCount} migrations completed.`,
);

if (migrationStartedCount !== migrationCompletedCount) {
	log('Error: Not all migrations completed.');
	process.exit(1);
}

log('Checking migration duration...');

// Get the start and end times of the migration
const migrationStartedTimes = [];
const migrationEndedTimes = [];

logFiles.forEach((file) => {
	const content = fs.readFileSync(
		path.join(logOptions.logDirectory, file),
		'utf8',
	);

	const startedMatches =
		content.match(/\[(.*)\] INFO -- Migration started/g) || [];
	const endedMatches =
		content.match(/\[(.*)\] INFO -- Migration complete/g) || [];

	migrationStartedTimes.push(
		...startedMatches.map((match) => match.slice(1, 20)),
	);
	migrationEndedTimes.push(...endedMatches.map((match) => match.slice(1, 20)));
});

const migrationStartedTime = migrationStartedTimes.sort()[0];
const migrationEndedTime = migrationEndedTimes.sort().slice(-1)[0];

if (!migrationStartedTime || !migrationEndedTime) {
	log('Error: Unable to determine migration start or end time.');
	process.exit(1);
}

log(
	`Migration started at ${migrationStartedTime} and ended at ${migrationEndedTime}`,
);
