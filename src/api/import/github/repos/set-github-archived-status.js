#!/usr/bin/env node

import {
	doRequest,
	getData,
	getStringifier,
	delay,
	currentTime,
} from '../../../../services/utils.js';
import {
	GITHUB_API_URL,
	SUCCESS_STATUS,
} from '../../../../services/constants.js';

const getArchiveRepoConfig = (repo, status, options) => {
	const { organization: org, serverUrl, token } = options;
	let url = `${GITHUB_API_URL}/repos/${org}/${repo}`;

	if (serverUrl) {
		url = `${serverUrl}/api/v3/repos/${org}/${repo}`;
	}

	return {
		method: 'patch',
		maxBodyLength: Infinity,
		url,
		data: JSON.stringify({ archived: status }),
		headers: {
			Accept: 'application/vnd.github+json',
			Authorization: `Bearer ${token}`,
		},
	};
};

export const archiveRequest = async (repo, status, options) => {
	const config = getArchiveRepoConfig(repo, status, options);
	return doRequest(config);
};

const setGithubArchivedStatus = async (options) => {
	try {
		const {
			repo,
			inputFile,
			organization: org,
			unarchive,
			outputFile,
			waitTime,
			skip,
		} = options;

		const columns = ['repo', 'status', 'statusText', 'errorMessage'];
		const outputFileName =
			(outputFile && outputFile.endsWith('.csv') && outputFile) ||
			`${org}-set-archived-status-${currentTime()}.csv`;
		const stringifier = getStringifier(outputFileName, columns);
		let repositories = [];

		if (repo) {
			repositories = [repo];
		} else {
			const repositoriesData = await getData(inputFile);
			repositories = repositoriesData.map((r) => r.repo);
		}

		let index = 0;

		for (const repo of repositories) {
			console.log(++index);

			if (skip >= index) continue;

			const response = await archiveRequest(repo, !unarchive, options);
			console.log(JSON.stringify(response, null, 2));
			let status = SUCCESS_STATUS;
			let statusText = '';
			let errorMessage = '';

			if (!response.data) {
				status = response.status;
				statusText = response.statusText;
				errorMessage = response.errorMessage;
			}

			console.log({ repo });
			stringifier.write({ repo, status, statusText, errorMessage });
			await delay(waitTime);
		}

		stringifier.end();
	} catch (error) {
		console.error(error);
	}
};

export default setGithubArchivedStatus;
