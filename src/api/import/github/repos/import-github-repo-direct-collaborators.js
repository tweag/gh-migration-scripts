#!/usr/bin/env node

import progress from 'cli-progress';
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
	const { organization: org, serverUrl, token } = options;
	let url = `${GITHUB_API_URL}/repos/${org}/${repo}/collaborators/${login}`;

	if (serverUrl) {
		url = `${serverUrl}/api/v3/repos/${org}/${repo}/collaborators/${login}`;
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

const importGithubRepoDirectCollaborators = async (options) => {
	try {
		const {
			organization: org,
			inputFile,
			reposFile,
			outputFile,
			waitTime,
			skip,
		} = options;

		let reposData = await getData(inputFile);
		reposData = reposData.slice(skip);

		if (reposFile) {
			const data = await getData(reposFile);
			const filterRepos = data.map((row) => row.repo);
			reposData = reposData.filter((row) => filterRepos.includes(row.repo));
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
		const progressBar = new progress.SingleBar(
			{},
			progress.Presets.shades_classic,
		);
		progressBar.start(reposData.length, 0);
		let index = 0;

		for (const repoData of reposData) {
			console.log(++index);

			const { repo, login, role } = repoData;
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

			progressBar.increment();
			await delay(waitTime);
		}

		progressBar.stop();
		stringifier.end();
	} catch (error) {
		console.error(error);
	}
};

export default importGithubRepoDirectCollaborators;
