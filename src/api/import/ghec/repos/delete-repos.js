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

const getDeleteRepoConfig = (repo, options) => {
	const { organization: org, serverUrl, token } = options;
	let url = `${GITHUB_API_URL}/repos/${org}/${repo}`;

	if (serverUrl) {
		url = `${serverUrl}/api/v3/repos/${org}/${repo}`;
	}

	return {
		method: 'delete',
		maxBodyLength: Infinity,
		url,
		headers: {
			Accept: 'application/vnd.github+json',
			Authorization: `Bearer ${token}`,
		},
	};
};

const deleteRequest = async (repo, options) => {
	const config = getDeleteRepoConfig(repo, options);
	return doRequest(config);
};

export const deleteRepos = async (options) => {
	try {
		const {
			inputFile,
			organization: org,
			repo,
			outputFile,
			waitTime,
			skip,
		} = options;

		const columns = ['repo', 'status', 'statusText', 'errorMessage'];
		const outputFileName =
			(outputFile && outputFile.endsWith('.csv') && outputFile) ||
			`${org}-delete-repos-status-${currentTime()}.csv`;
		const stringifier = getStringifier(outputFileName, columns);

		let repositories;

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

			const response = await deleteRequest(repo, options);
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
