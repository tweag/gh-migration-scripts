#!/usr/bin/env node

import fs from 'node:fs';
import readline from 'node:readline';
import {
	doRequest,
	delay,
	getData,
	getStringifier,
	currentTime,
} from '../../../../services/utils.js';
import { archiveFunction } from './utils.js';
import {
	ARCHIVE_ERROR_MESSAGE,
	ARCHIVE_STATUS_CODE,
	GITHUB_API_URL,
	SUCCESS_STATUS,
} from '../../../../services/constants.js';

const getUsersRepoConfig = ({ options, repo, login, role }) => {
	const { organization: org, githubUrl, token } = options;
	let url = `${GITHUB_API_URL}/repos/${org}/${repo}/collaborators/${login}`;

	if (githubUrl) {
		url = `${githubUrl}/api/v3/repos/${org}/${repo}/collaborators/${login}`;
	}

	const config = {
		method: 'put',
		maxBodyLength: Infinity,
		url,
		headers: {
			Accept: 'application/vnd.github+json',
			Authorization: `Bearer ${token}`,
		},
	};

	if (options.isDelete) {
		config.method = 'delete';
		return config;
	}

	config.data = JSON.stringify({ permission: role });

	return config;
};

const setDirectCollaborator = async (details) => {
	const config = getUsersRepoConfig(details);
	return doRequest(config);
};

export const setRepoDirectCollaborators = async (options) => {
	try {
		let filterRepos = [];
		const {
			organization: org,
			file,
			reposFile,
			outputFile,
			waitTime,
			skip,
		} = options;

		if (reposFile) {
			const data = await getData(reposFile);
			filterRepos = data.map((row) => row.repo);
		}

		const output = outputFile;
		const columns = [
			'repo',
			'login',
			'role',
			'status',
			'statusText',
			'errorMessage',
		];
		const outputFileName =
			(outputFile && outputFile.endsWith('.csv') && outputFile) ||
			`${org}-set-repo-collaborators-status-${currentTime()}.csv`;
		const stringifier = getStringifier(outputFileName, columns);
		const fileStream = fs.createReadStream(file);

		const rl = readline.createInterface({
			input: fileStream,
			crlfDelay: Infinity,
		});

		let firstLine = true;
		let index = 0;

		for await (const line of rl) {
			if (firstLine) {
				firstLine = false;
				continue;
			}

			console.log(++index);

			const rowArr = line.split(',');
			const repo = rowArr[0];
			const login = rowArr[1];
			let role = rowArr[2];

			if (!reposFile || filterRepos.includes(repo)) {
				if (index > skip) {
					const response = await setDirectCollaborator({
						options,
						repo,
						login,
						role,
					});
					console.log(JSON.stringify(response, null, 2));
					let status = SUCCESS_STATUS;
					let statusText = '';
					let errorMessage = '';

					if (!response.data) {
						status = response.status;
						statusText = response.statusText;
						errorMessage = response.errorMessage;
					}

					if (
						status === ARCHIVE_STATUS_CODE &&
						errorMessage === ARCHIVE_ERROR_MESSAGE
					) {
						await archiveFunction(options, repo, output, true);
						const retryResponse = await setDirectCollaborator({
							options,
							repo,
							login,
							role,
						});
						await archiveFunction(options, repo, output, false);

						if (!retryResponse.data) {
							status = retryResponse.status;
							statusText = retryResponse.statusText;
							errorMessage = retryResponse.errorMessage;
						} else {
							status = SUCCESS_STATUS;
							statusText = '';
							errorMessage = '';
						}
					}

					console.log({ repo, login, role });
					stringifier.write({
						repo,
						login,
						role,
						status,
						statusText,
						errorMessage,
					});

					await delay(waitTime);
				}
			}
		}

		stringifier.end();
	} catch (error) {
		console.error(error);
	}
};
