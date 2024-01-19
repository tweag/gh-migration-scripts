#!/usr/bin/env node

import progress from 'cli-progress';
import Table from 'cli-table';
import {
	doRequest,
	getData,
	getStringifier,
	delay,
	currentTime,
} from '../../../../services/utils.js';
import * as speak from '../../../../services/style-utils.js';
import { tableChars } from '../../../../services/style-utils.js';
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

const getOutputFileName = (outputFile, org) => {
	if (outputFile && outputFile.endsWith('.csv')) return outputFile;
	return `${org}-delete-repos-status-${currentTime()}.csv`;
};

const columns = ['repo', 'status', 'statusText', 'errorMessage'];
const tableHead = [
	'Organization',
	'Total no. of repos',
	'No. of repos deleted',
].map((h) => speak.successColor(h));

const deleteGithubRepos = async (options) => {
	try {
		const {
			inputFile,
			organization: org,
			repo,
			outputFile,
			waitTime,
			skip,
		} = options;
		let isMultiple = true;

		if (repo) isMultiple = false;

		const outputFileName = getOutputFileName(outputFile, org);
		const stringifier = getStringifier(outputFileName, columns);
		const table = new Table({
			chars: tableChars,
			head: tableHead,
		});

		let repositories;

		if (repo) {
			repositories = [repo];
		} else {
			const repositoriesData = await getData(inputFile);
			repositories = repositoriesData.map((r) => r.repo).slice(skip);
		}
		let index = 0;
		let failedRequests = 0;
		let progressBar;
		let totalCount = 1;

		if (isMultiple) {
			totalCount = repositories.length;
			progressBar = new progress.SingleBar({}, progress.Presets.shades_classic);
			progressBar.start(totalCount, 0);
		}

		for (const repo of repositories) {
			if (isMultiple) progressBar.increment();
			console.log(++index);
			const response = await deleteRequest(repo, options);
			console.log(JSON.stringify(response, null, 2));
			let status = SUCCESS_STATUS;
			let statusText = '';
			let errorMessage = '';

			if (!response.data) {
				failedRequests++;
				status = response.status;
				statusText = response.statusText;
				errorMessage = response.errorMessage;
			}

			console.log({ repo });
			stringifier.write({ repo, status, statusText, errorMessage });
			await delay(waitTime);
		}

		if (isMultiple) progressBar.stop();

		if (isMultiple) table.push([org, totalCount, totalCount - failedRequests]);
		stringifier.end();
	} catch (error) {
		console.error(error);
	}
};

export default deleteGithubRepos;
