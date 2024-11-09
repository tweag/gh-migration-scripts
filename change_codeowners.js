#!/usr/bin/env node

import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import os from 'os';
import { parse } from 'fast-csv';

// Function to print usage
const printUsage = () => {
	console.log(
		'Usage: npx change-codeowners -s [sed_script] -i [input_csv] -t [temp_dir] -n [commit_username] -e [commit_email] -h [help]',
		'\n',
		'  -s: [sed_script] SED script file for updating CODEOWNERS.',
		'\n',
		'  -i: [input_csv] A CSV with source_org,source_repo.',
		'\n',
		'  -t: [temp_dir] Working directory (optional, uses a new temporary directory if not specified).',
		'\n',
		'  -n: [commit_username] Username for the commit message when CODEOWNERS is updated.',
		'\n',
		'  -e: [commit_email] Email for the commit message when CODEOWNERS is updated.',
		'\n',
		'  -h: [help] Show usage information.',
		'\n',
		'Ensure that a valid GITHUB_TOKEN environment variable is set for access to the repositories.',
		'\n',
		'Learn more: https://tinyurl.com/3pzbw4cp',
		'\n',
	);
};

// Default values
const logFile = 'change_codeowners.log';
const directories = ['', '.github/', 'docs/'];
const expectedCSVHeaders = ['source_org', 'source_repo'];
let tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gh-codeowners-'));
let sedFile = '';
let inputFile = '';
let commitUsername = '';
let commitEmail = '';

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
		case '-s':
			sedFile = args[++i];
			break;
		case '-i':
			inputFile = args[++i];
			break;
		case '-t':
			tempDir = args[++i];
			break;
		case '-n':
			commitUsername = args[++i];
			break;
		case '-e':
			commitEmail = args[++i];
			break;
		case '-h':
			printUsage();
			process.exit(0);
		default:
			printUsage();
			process.exit(1);
	}
}

// Check if required parameters are provided
checkRequiredArg(sedFile, 'Sed File (-s)');
checkRequiredArg(inputFile, 'Input CSV (-i)');
checkRequiredArg(commitUsername, 'Commit Username (-n)');
checkRequiredArg(commitEmail, 'Commit Email (-e)');

// Helper function to execute shell commands
const execCommand = (cmd) => {
	// Possible to run in offline mode, useful for testing
	if (process.env.OFFLINE_MODE === 'true') {
		if (cmd.includes('gh api')) {
			if (cmd.includes('--method PUT')) {
				return 'Successfully updated CODEOWNERS';
			}

			return `mocked_sha_value\n${Buffer.from(
				'Mock CODEOWNERS content\n/docs @old_owner\n/src @old_owner',
			).toString('base64')}`;
		}
	}

	try {
		return execSync(cmd, { stdio: 'pipe' }).toString();
	} catch (error) {
		// If the error comes from `diff` and it's a difference (exit code 1), treat it as expected behavior
		if (error.status === 1 && cmd.includes('diff')) {
			return error.stdout.toString(); // Return the diff output as expected
		}

		log(`Error: Failed to execute command: ${cmd}`);
		throw error;
	}
};

// Parse the CSV file and process each repository
log('Starting CODEOWNERS update process...');
fs.createReadStream(inputFile)
	.pipe(parse({ headers: true }))
	.on('headers', (headers) => {
		validateHeaders(headers);
	})
	.on('data', (row) => {
		const { source_org: sourceOrg, source_repo: sourceRepo } = row;

		for (const directory of directories) {
			const tempFile = path.join(
				tempDir,
				`CODEOWNERS_${sourceRepo}_${directory.replace(/\/$/, '')}`,
			);
			log(
				`Processing ${sourceOrg}/${sourceRepo}/${directory}CODEOWNERS (temp file: ${tempFile})`,
			);

			try {
				const result = execCommand(
					`gh api repos/${sourceOrg}/${sourceRepo}/contents/${directory}CODEOWNERS -q ".sha,.content"`,
				);
				fs.writeFileSync(tempFile, result);

				const decodedFile = `${tempFile}.decoded`;
				execCommand(`tail -n +2 ${tempFile} | base64 -d > ${decodedFile}`);

				if (fs.existsSync(decodedFile) && fs.statSync(decodedFile).size > 0) {
					execCommand(`sed -i.bak -f ${sedFile} ${decodedFile}`);
					if (fs.existsSync(decodedFile) && fs.statSync(decodedFile).size > 0) {
						const diffOutput = execCommand(
							`diff -w ${decodedFile} ${decodedFile}.bak`,
						);
						if (diffOutput) {
							const encodedContent = Buffer.from(
								fs.readFileSync(tempFile, 'utf8'),
							).toString('base64');

							const sha = fs.readFileSync(tempFile, 'utf8').split('\n')[0];
							execCommand(
								`gh api --method PUT repos/${sourceOrg}/${sourceRepo}/contents/${directory}CODEOWNERS -f "message=update codeowners" -f "committer[name]=${commitUsername}" -f "committer[email]=${commitEmail}" -f "content=${encodedContent}" -f "sha=${sha}"`,
							);
							log(
								`Updated ${directory}CODEOWNERS for ${sourceOrg}/${sourceRepo}`,
							);
						}
					} else {
						log(
							`Error: Failed to create valid CODEOWNERS file for ${sourceOrg}/${sourceRepo}`,
						);
						process.exit(1);
					}
				} else {
					log(
						`No ${directory}CODEOWNERS file found for ${sourceOrg}/${sourceRepo}, skipping...`,
					);
				}
			} catch (error) {
				console.error(error);
				log(
					`Failed updating ${directory}CODEOWNERS for ${sourceOrg}/${sourceRepo}`,
				);
			}
		}
	})
	.on('end', () => {
		log('Finished updating CODEOWNERS for all repositories.');
	});
