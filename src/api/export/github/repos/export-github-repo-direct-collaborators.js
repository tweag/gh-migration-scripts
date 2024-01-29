#!/usr/bin/env node

import { progressBar } from 'progress-bar-cli';
import Table from 'cli-table';
import * as speak from '../../../../services/style-utils.js';
import { tableChars } from '../../../../services/style-utils.js';
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
	PROGRESS_BAR_CLEAR_NUM,
} from '../../../../services/constants.js';
import exportGithubOutsideCollaborators from '../users/export-github-outside-collaborators.js';

const getReposDirectCollaboratorsConfig = (repo, options) => {
	const { organization: org, serverUrl, token } = options;
	let url = `${GITHUB_API_URL}/repos/${org}/${repo}/collaborators?affiliation=direct&per_page=100`;

	if (serverUrl) {
		url = `${serverUrl}/api/v3/repos/${org}/${repo}/collaborators?affiliation=direct&per_page=100`;
	}

	return {
		method: 'get',
		maxBodyLength: Infinity,
		url,
		headers: {
			Accept: 'application/vnd.github+json',
			Authorization: `Bearer ${token}`,
		},
	};
};

const fetchRepoDirectCollaborators = async (repo, options) => {
	const config = getReposDirectCollaboratorsConfig(repo, options);
	return doRequest(config);
};

const getOutputFileName = (org, outputFile) => {
	if (outputFile && outputFile.endsWith('.csv')) return outputFile;
	return `${org}-repo-direct-collaborators-${currentTime()}.csv`;
};

const tableHead = ['No.', 'Repo', 'No. of direct collaborators'].map((h) =>
	speak.successColor(h),
);

const exportGithubRepoDirectCollaborators = async (options) => {
	try {
		const {
			inputFile,
			outsideCollaboratorsFile,
			usersFile,
			organization: org,
			outputFile,
			waitTime,
			skip,
		} = options;

		speak.success(
			`Started fetching repositories direct collaborators for ${org}`,
		);

		const columns = ['repo', 'login', 'role'];
		const statusColumns = ['repo', 'status', 'statusText', 'errorMessage'];
		const outputFileName = getOutputFileName(org, outputFile);
		const stringifier = getStringifier(outputFileName, columns);
		const statusStringifier = getStringifier(
			`status-${outputFileName}`, statusColumns);
		const table = new Table({
			head: tableHead,
			chars: tableChars,
		});
		let enterpriseUsers = [];
		let outsideCollaborators = [];

		if (usersFile) {
			const usersData = await getData(usersFile);
			enterpriseUsers = usersData.map((row) => row.login.toLowerCase());
		}

		if (outsideCollaboratorsFile) {
			const data = await getData(outsideCollaboratorsFile);
			outsideCollaborators = data.map((row) => row.login.toLowerCase());
		} else {
			outsideCollaborators = await exportGithubOutsideCollaborators(options);
		}

		let index = 0;

		const repos = (await getData(inputFile)).slice(Number(skip)).map(row => row.repo);
		const reposLength = repos.length;

		for (const repo of repos) {
			progressBar(index, reposLength, new Date(), PROGRESS_BAR_CLEAR_NUM);
			++index;
			const response = await fetchRepoDirectCollaborators(repo, options);
			speak.info('\n' + `Repository ${repo}`);
			let status = response.status;
			let statusText = response.statusText;
			let errorMessage = response.errorMessage;
			let collaboratorsCount = 0;

			if (errorMessage) {
				speak.error(errorMessage);
			}

			if (response.data) {
				(status = SUCCESS_STATUS), (statusText = '');
				errorMessage = '';
				const directCollaborators = response.data;
				const directUsers = directCollaborators.map((user) => {
					user.login = user.login.toLowerCase();

					return user;
				});

				for (const user of directUsers) {
					const { login, role_name: role } = user;

					if (outsideCollaborators.includes(login)) continue;

					if (enterpriseUsers.length > 0 && !enterpriseUsers.includes(login))
						continue;

					collaboratorsCount++;
					stringifier.write({ repo, login, role });
				}
			}

			await delay(waitTime);
			statusStringifier.write({ repo, status, statusText, errorMessage });
			table.push([`${index}.`, repo, collaboratorsCount]);
		}

		console.log('\n' + table.toString());
		stringifier.end();
		speak.success(
			`Successfully saved repositories direct collaborators to ${outputFileName}`,
		);
	} catch (error) {
		speak.error(error);
		speak.error('Failed to get repositories direct collaborators');
	}
};

export default exportGithubRepoDirectCollaborators;
