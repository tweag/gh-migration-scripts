#!/usr/bin/env node

import fs from 'fs';
import { execSync } from 'child_process';
import { parse } from 'fast-csv';

// Function to print usage
const printUsage = () => {
	console.log(
		'Migrate secrets (without values) for a given list of repositories',
		'\n',
		'Usage: npx migrate-secrets -i [input_csv] [-s [source_token]] [-t [destination_token]] [-z [override_destination_org]] [-y [override_destination_repo_prefix]] [-a [ghes_hostname]] [-l [log_file]]',
		'\n',
		'  -i [input_csv] A CSV with source_org,source_repo,destination_org,destination_repo',
		'\n',
		'  -s [source_token] Source system token (optional, if not provided, GH_SRC_PAT environment variable will be used)',
		'\n',
		'  -t [destination_token] Destination system token (optional, if not provided, GH_DEST_PAT environment variable will be used)',
		'\n',
		'  -z [override_destination_org] Override destination org with this value (optional, useful for testing)',
		'\n',
		'  -y [override_destination_repo_prefix] Prepend prefix to destination repo names (optional, useful for testing)',
		'\n',
		'  -a [ghes_hostname] GHES hostname (not API URL, optional, required for GHES)',
		'\n',
		'  -l [log_file] Log file path (optional, default: migrate_secrets.log)',
	);
};

// Default values
const logFile = 'migrate_secrets.log';
const expectedCSVHeaders = [
	'source_org',
	'source_repo',
	'destination_org',
	'destination_repo',
];
let overrideDestinationOrg = '';
let overrideDestinationRepoPrefix = '';
let apiUrl = '';
let inputFile, sourceToken, destinationToken;

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

// Function to validate header row
const validateHeaders = (headers) => {
	for (let header of expectedCSVHeaders) {
		if (!headers.includes(header)) {
			log(`Error: Missing required header "${header}" in CSV file.`);
			printUsage();
			process.exit(1);
		}
	}
};

// Parse command-line options
const args = process.argv.slice(2);

// Parse arguments
for (let i = 0; i < args.length; i++) {
	switch (args[i]) {
		case '-i':
			inputFile = args[++i];
			break;
		case '-s':
			sourceToken = args[++i];
			break;
		case '-t':
			destinationToken = args[++i];
			break;
		case '-z':
			overrideDestinationOrg = args[++i];
			break;
		case '-y':
			overrideDestinationRepoPrefix = args[++i];
			break;
		case '-a':
			apiUrl = args[++i];
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

// Check if the input file exists
if (!fs.existsSync(inputFile)) {
	log(`Error: Input file '${inputFile}' does not exist.`);
	process.exit(1);
}

// Check if source and destination tokens are available
checkRequiredArg(sourceToken, 'Source token (-s or GH_SRC_PAT)');
checkRequiredArg(destinationToken, 'Destination token (-t or GH_DEST_PAT)');

// Helper function to execute shell commands
const execCommand = (cmd) => {
	// Possible to run in offline mode, useful for testing
	if (process.env.OFFLINE_MODE === 'true') {
		if (cmd.includes('gh secret list')) {
			return 'MOCK_SECRET_1\nMOCK_SECRET_2';
		} else if (cmd.includes('gh secret set')) {
			return 'Mock secret set successfully';
		}
	}

	try {
		return execSync(cmd, { stdio: 'pipe' }).toString();
	} catch (error) {
		log(`Error: Failed to execute command: ${cmd}`);
		process.exit(1);
	}
};

// Parse the CSV file and process each repository
fs.createReadStream(inputFile)
	.pipe(parse({ headers: true }))
	.on('headers', (headers) => {
		validateHeaders(headers);
	})
	.on('data', (row) => {
		const {
			source_org: sourceOrg,
			source_repo: sourceRepo,
			destination_org,
			destination_repo,
		} = row;

		const destinationOrg = overrideDestinationOrg || destination_org;
		const destinationRepo = `${overrideDestinationRepoPrefix}${destination_repo}`;

		log(`Fetching secrets for ${sourceOrg}/${sourceRepo}`);

		// Fetch secrets using the GitHub CLI
		const fetchSecretsCmd = apiUrl
			? `GH_HOST="${apiUrl}" GH_ENTERPRISE_TOKEN="${sourceToken}" gh secret list --repo ${apiUrl}/${sourceOrg}/${sourceRepo}`
			: `gh secret list --repo ${sourceOrg}/${sourceRepo}`;

		const secrets = execCommand(fetchSecretsCmd)
			.trim()
			.split('\n')
			.map((secret) => secret.split('\t')[0]);

		if (secrets.length === 0) {
			log(`No secrets found for ${sourceOrg}/${sourceRepo}`);
			return;
		}

		// Migrate each secret to the destination repository
		secrets.forEach((secretName) => {
			log(`Migrating ${secretName} -> ${destinationOrg}/${destinationRepo}`);
			const migrateSecretCmd = `GITHUB_TOKEN="${destinationToken}" gh secret set "${secretName}" --body placeholder --repo "${destinationOrg}/${destinationRepo}"`;
			execCommand(migrateSecretCmd);
		});
	})
	.on('end', () => {
		log('Secrets migration completed.');
	});
