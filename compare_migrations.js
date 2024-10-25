#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import os from 'os';
import { parse } from 'fast-csv';

// Function to print usage
const printUsage = () => {
	console.log(
		'Usage: npx compare-migrations -i [input_csv] -a [source_api_url] -o [output_csv] -s [source_token] -t [destination_token] -p [path_to_analyzer] [-w [working_directory]] [-z [override_destination_org]] [-y [override_destination_repo_prefix]]',
		'\n',
		'  -i [input_csv] A CSV with source_org,source_repo,destination_org,destination_repo',
		'\n',
		'  -a [source_api_graphql_url] Source API GRAPHQL URL (required for GHES)',
		'\n',
		'  -o [output_csv] A CSV file with match,source_org,source_repo,source_signature,target_org,target_repo,target_signature',
		'\n',
		'  -s [source_token] Source system token (optional, if not provided, GH_SRC_PAT environment variable will be used)',
		'\n',
		'  -t [destination_token] Destination system token (optional, if not provided, GH_DEST_PAT environment variable will be used)',
		'\n',
		'  -p [path_to_analyzer] Path to the GitHub migration analyzer (optional, default: ./gh-migration-analyzer)',
		'\n',
		'  -w [working_directory] Working directory (optional, uses a new temporary directory if not specified)',
		'\n',
		'  -z [override_destination_org] Override destination org with this value (optional, useful for testing)',
		'\n',
		'  -y [override_destination_repo_prefix] Prepend prefix to destination repo names (optional, useful for testing)',
		'\n',
		'  -l [log_file] Log file path (optional, default: compare_migrations.log)',
	);
};

// Default values
let tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gh-migration-'));
let logFile = 'compare_migrations.log';
let pathToAnalyzer = './gh-migration-analyzer';
let overrideDestinationOrg = '';
let overrideDestinationRepoPrefix = '';

// Parse command-line options
const args = process.argv.slice(2);
let inputFile, outputFile, sourceToken, destinationToken, ghesApiUrl;

// Function to log messages
const log = (message) => {
	const timestamp = new Date().toISOString();
	const logMessage = `[${timestamp}] ${message}`;
	fs.appendFileSync(logFile, `${logMessage}\n`);
	console.log(logMessage);
};

// Check if a required argument is provided
const checkRequiredArg = (arg, argName) => {
	if (!arg) {
		log(`Error: ${argName} is required.`);
		printUsage();
		process.exit(1);
	}
};

// Parse arguments
for (let i = 0; i < args.length; i++) {
	switch (args[i]) {
		case '-i':
			inputFile = args[++i];
			break;
		case '-o':
			outputFile = args[++i];
			break;
		case '-s':
			sourceToken = args[++i];
			break;
		case '-t':
			destinationToken = args[++i];
			break;
		case '-a':
			ghesApiUrl = args[++i];
			break;
		case '-p':
			pathToAnalyzer = args[++i];
			break;
		case '-w':
			tmpDir = args[++i];
			break;
		case '-z':
			overrideDestinationOrg = args[++i];
			break;
		case '-y':
			overrideDestinationRepoPrefix = args[++i];
			break;
		case '-l':
			logFile = args[++i];
			break;
		case '-h':
			printUsage();
			process.exit(0);
		default:
			printUsage();
			process.exit(1);
	}
}

// Set defaults for tokens from environment variables
sourceToken = sourceToken || process.env.GH_SRC_PAT;
destinationToken = destinationToken || process.env.GH_DEST_PAT;

// Check if required parameters are provided
checkRequiredArg(inputFile, 'Input CSV (-i)');
checkRequiredArg(outputFile, 'Output CSV (-o)');
checkRequiredArg(ghesApiUrl, 'Source API GRAPHQL URL (-a)');

// Check if the input file exists
if (!fs.existsSync(inputFile)) {
	log(`Error: Input file '${inputFile}' does not exist.`);
	process.exit(1);
}

// Check if source and destination tokens are available
checkRequiredArg(sourceToken, 'Source token (-s or GH_SRC_PAT)');
checkRequiredArg(destinationToken, 'Destination token (-t or GH_DEST_PAT)');

// Check if the path to migration analyzer exists
if (!fs.existsSync(pathToAnalyzer) && process.env.OFFLINE_MODE !== 'true') {
	log(`Error: Path to migration analyzer not found at '${pathToAnalyzer}'.`);
	process.exit(1);
}

// Check if GitHub migration analyzer is available
const analyzerScript = path.join(pathToAnalyzer, 'src', 'index.js');
if (!fs.existsSync(analyzerScript) && process.env.OFFLINE_MODE !== 'true') {
	log(`Error: GitHub migration analyzer not found at '${analyzerScript}'.`);
	process.exit(1);
}

log(`Working in ${tmpDir}`);

// Copy the input file to the working directory
const inputFileCopy = path.join(tmpDir, path.basename(inputFile));
fs.copyFileSync(inputFile, inputFileCopy);

// Create the output CSV file
const outputFileStream = fs.createWriteStream(outputFile);

// Print output CSV header
outputFileStream.write(
	'match,source_org,source_repo,source_signature,destination_org,destination_repo,destination_signature\n',
);

// Helper function to execute analyzer command
const execAnalyzer = (org, token, apiUrl = '') => {
	const cmd = apiUrl
		? `${analyzerScript} GH-org -o ${org} -a -s ${apiUrl} -t ${token}`
		: `${analyzerScript} GH-org -o ${org} -t ${token}`;
	try {
		execSync(cmd, { stdio: 'inherit' });
		return true;
	} catch (error) {
		log(`Error: Failed to download data for ${org}`);
		return false;
	}
};

// Helper function to compare signatures
const getRepoSignature = (repo, file) => {
	const data = fs.readFileSync(file, 'utf8');
	const lines = data.split('\n').filter((l) => l.startsWith(repo));
	return lines.length ? lines[0].split(',').slice(2, 7).join(',') : '';
};

log('Downloading required data files...');

fs.createReadStream(inputFileCopy)
	.pipe(parse({ headers: true }))
	.on('data', (row) => {
		const { source_org, source_repo, destination_org, destination_repo } = row;

		const destinationOrg = overrideDestinationOrg || destination_org;
		const destinationRepo = `${overrideDestinationRepoPrefix}${destination_repo}`;

		// Download source data
		const sourceMetricsFile = path.join(
			tmpDir,
			`${source_org}-metrics/repo-metrics.csv`,
		);
		if (!fs.existsSync(sourceMetricsFile)) {
			log(`-> Downloading org data for ${source_org}`);
			if (!execAnalyzer(source_org, sourceToken, ghesApiUrl)) process.exit(1);
		}
		// Download destination data
		const destinationMetricsFile = path.join(
			tmpDir,
			`${destinationOrg}-metrics/repo-metrics.csv`,
		);
		if (!fs.existsSync(destinationMetricsFile)) {
			log(`-> Downloading org data for ${destinationOrg}`);
			if (!execAnalyzer(destinationOrg, destinationToken)) process.exit(1);
		}

		const sourceSignature = getRepoSignature(source_repo, sourceMetricsFile);
		const destinationSignature = getRepoSignature(
			destinationRepo,
			destinationMetricsFile,
		);
		const match = sourceSignature === destinationSignature ? 'TRUE' : 'FALSE';

		// Write to output
		outputFileStream.write(
			`${match},${source_org},${source_repo},"${sourceSignature}",${destinationOrg},${destinationRepo},"${destinationSignature}"\n`,
		);
	})
	.on('end', () => {
		outputFileStream.end();
		log(`Data files and output can be found in ${tmpDir}`);
	});
