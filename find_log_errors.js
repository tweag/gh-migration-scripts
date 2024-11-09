#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Function to print usage
const printUsage = () => {
	console.log(
		'Usage: npx find-log-errors [-d [log_directory]] [-l [log_file]]',
	);
	console.log(
		'This script examines a directory containing all the log files after starting migrations with the GEI tool, and finds which ones failed with errors.',
	);
	console.log(
		'It outputs a list of the source org, source repo, destination org, destination repo, and the error message.',
	);
	console.log(
		'-d [log_directory] Directory containing log files (optional, default: current working directory)',
	);
	console.log(
		'-l [log_file] Log file path (optional, default: find_log_errors.log)',
	);
};

// Default values
let logOptions = {
	logFile: 'find_log_errors.log',
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

// Check if the log directory exists
if (!fs.existsSync(logOptions.logDirectory)) {
	log(`Error: Log directory '${logOptions.logDirectory}' does not exist.`);
	process.exit(1);
}

// Check if log files exist in the specified directory
const logFiles = fs
	.readdirSync(logOptions.logDirectory)
	.filter((file) => file.endsWith('.octoshift.log'));

if (logFiles.length === 0) {
	log(
		`Error: No log files found in the directory '${logOptions.logDirectory}'.`,
	);
	printUsage();
	process.exit(1);
}

log(`Searching for errors in log files in '${logOptions.logDirectory}'...`);

// Print the header
log('source_org,source_repo,destination_org,destination_repo,error_message');

// Process each log file
logFiles.forEach((logFile) => {
	const logFilePath = path.join(logOptions.logDirectory, logFile);
	const verboseLogFilePath = logFilePath.replace(
		'.octoshift.log',
		'.octoshift.verbose.log',
	);

	const logFileContent = fs.readFileSync(logFilePath, 'utf8');
	const verboseLogFileContent = fs.readFileSync(verboseLogFilePath, 'utf8');

	const errorMatch = verboseLogFileContent.match(/\[ERROR\] (.*)/);
	const error = errorMatch ? errorMatch[1] : '';

	if (error) {
		const sourceOrg =
			logFileContent.match(/GITHUB SOURCE ORG: ([^\s]*)/)?.[1] || '';
		const sourceRepo = logFileContent.match(/SOURCE REPO: ([^\s]*)/)?.[1] || '';
		const destinationOrg =
			logFileContent.match(/GITHUB TARGET ORG: ([^\s]*)/)?.[1] || '';
		const destinationRepo =
			logFileContent.match(/TARGET REPO: ([^\s]*)/)?.[1] || '';

		log(
			`${sourceOrg},${sourceRepo},${destinationOrg},${destinationRepo},"${error}"`,
		);
	}
});
