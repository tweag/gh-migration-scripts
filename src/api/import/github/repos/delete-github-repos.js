#!/usr/bin/env node

import { progressBar } from 'progress-bar-cli';
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
	PROGRESS_BAR_CLEAR_NUM,
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
	return `${org}-delete-repos-${currentTime()}.csv`;
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

		if (repo) {
			isMultiple = false;
			speak.success('Started deleting repositories');
		} else {
			speak.success(`Started deleting repo: ${repo}`);
		}

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
		let totalCount = 1;

		if (isMultiple) {
			totalCount = repositories.length;
		}

		for (const repo of repositories) {
			progressBar(index, totalLength, new Date(), PROGRESS_BAR_CLEAR_NUM);
			++index;
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

		if (isMultiple) {
			table.push([org, totalCount, totalCount - failedRequests]);
			console.log('\n' + table.toString());
			speak.success(`Successfully deleted repositories for org: ${org}`);
		} else {
			speak.success(`Successfully deleted repo: ${repo}`);
		}

		stringifier.end();
	} catch (error) {
		console.error(error);
	}
};

export default deleteGithubRepos;
