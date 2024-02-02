#!/usr/bin/env node

import { progressBar } from 'progress-bar-cli';
import Table from 'cli-table';
import {
	doRequest,
	delay,
	getData,
	getStringifier,
	currentTime,
} from '../../../../services/utils.js';
import { archiveFunction } from './utils.js';
import { tableChars } from '../../../../services/style-utils.js';
import * as speak from '../../../../services/style-utils.js';
import {
	ARCHIVE_ERROR_MESSAGE,
	ARCHIVE_STATUS_CODE,
	GITHUB_API_URL,
	SUCCESS_STATUS,
	PROGRESS_BAR_CLEAR_NUM,
} from '../../../../services/constants.js';

const columns = [
	'repo',
	'login',
	'role',
	'status',
	'statusText',
	'errorMessage',
];

const tableHead = [
	'Repo',
	'No. of collaborators added',
	'No. of failedRequests',
].map((h) => speak.successColor(h));
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

const getOutputFileName = (outputFile, org) => {
	if (outputFile && outputFile.endsWith('.csv')) return outputFile;
	return `${org}-set-repo-collaborators-status-${currentTime()}.csv`;
};

const setReposMap = (reposMap, repo, type) => {
	if (type === 'succeeded') {
		if (!reposMap.has(repo)) {
			reposMap.set(repo, [1, 0]);
		} else {
			const [succeededNum, failedNum] = reposMap.get(repo);
			reposMap.set(repo, [succeededNum + 1, failedNum]);
		}
	} else {
		if (!reposMap.has(repo)) {
			reposMap.set(repo, [0, 1]);
		} else {
			const [succeededNum, failedNum] = reposMap.get(repo);
			reposMap.set(repo, [succeededNum, failedNum + 1]);
		}
	}
};

const printTable = (reposMap) => {
	const table = new Table({
		chars: tableChars,
		head: tableHead,
	});

	for (const [repo, count] of reposMap) {
		table.push([repo, count[0], count[1]]);
	}

	console.log('\n' + table.toString());
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

		speak.success(`Started importing repositories' direct collaborators for org: ${org}`);
		let reposData = await getData(inputFile);
		reposData = reposData.slice(skip);

		if (reposFile) {
			const data = await getData(reposFile);
			const filterRepos = data.map((row) => row.repo);
			reposData = reposData.filter((row) => filterRepos.includes(row.repo));
		}

		const output = outputFile;
		const outputFileName = getOutputFileName(output, org);
		const stringifier = getStringifier(outputFileName, columns);
		let index = 0;
		const reposMap = new Map();

		for (const repoData of reposData) {
			progressBar(index, reposLength, new Date(), PROGRESS_BAR_CLEAR_NUM);
			++index;

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
				setReposMap(reposMap, repo, 'failed');
			} else {
				setReposMap(reposMap, repo, 'succeeded');
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

		printTable(reposMap);
		speak.success(`Successfully imported repositories direct collaborators for ${org}`);
		stringifier.end();
	} catch (error) {
		speak.error(error);
		speak.error('Failed to import repository direct collaborators');
	}
};

export default importGithubRepoDirectCollaborators;
