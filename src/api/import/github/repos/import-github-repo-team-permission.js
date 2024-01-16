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

const getSetRepoTeamPermissionConfig = ({
	repo,
	team,
	permission,
	options,
}) => {
	const { organization: org, serverUrl, token } = options;
	let url = `${GITHUB_API_URL}/orgs/${org}/teams/${team}/repos/${org}/${repo}`;

	if (serverUrl) {
		url = `${serverUrl}/api/v3/orgs/${org}/teams/${team}/repos/${org}/${repo}`;
	}

	return {
		method: 'put',
		maxBodyLength: Infinity,
		url,
		data: JSON.stringify({ permission }),
		headers: {
			Accept: 'application/vnd.github+json',
			Authorization: `Bearer ${token}`,
		},
	};
};

const setTeamPermission = async (details) => {
	const config = getSetRepoTeamPermissionConfig(details);
	return doRequest(config);
};

const importGithubRepoTeamPermission = async (options) => {
	try {
		const {
			inputFile,
			reposFile,
			organization: org,
			outputFile,
			waitTime,
			skip,
		} = options;

		const outputFileName =
			(outputFile && outputFile.endsWith('.csv') && outputFile) ||
			`${org}-set-repo-team-permission-status-${currentTime()}.csv`;
		const columns = [
			'repo',
			'team',
			'permission',
			'status',
			'statusText',
			'errorMessage',
		];
		const stringifier = getStringifier(outputFileName, columns);
		const fileStream = fs.createReadStream(inputFile);
		let filterRepos = [];

		if (reposFile) {
			const data = await getData(reposFile);
			filterRepos = data.map((row) => row.repo);
		}

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
			const team = rowArr[1];

			if (!options.reposFile || filterRepos.includes(repo)) {
				if (index > skip) {
					const permission = rowArr[2];
					const response = await setTeamPermission({
						repo,
						team,
						permission,
						options,
					});

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
						await archiveFunction(options, repo, outputFile, true);
						const retryResponse = await setTeamPermission({
							repo,
							team,
							permission,
							options,
						});
						await archiveFunction(options, repo, outputFile, false);

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

					console.log(JSON.stringify(response, null, 2));
					console.log({ repo, team, permission });
					stringifier.write({
						repo,
						team,
						permission,
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

export default importGithubRepoTeamPermission;
