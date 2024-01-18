#!/usr/bin/env node

import progress from 'cli-progress';
import * as speak from '../../../../services/speak.js';
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
		const outputFileName =
			(outputFile && outputFile.endsWith('.csv') && outputFile) ||
			`${org}-repo-direct-collaborators-${currentTime()}.csv`;
		const stringifier = getStringifier(outputFileName, columns);
		const statusStringifier = getStringifier(
			`${org}-repo-direct-collaborators-status.csv`,
			statusColumns,
		);
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

		let repos = await getData(inputFile);
		repos = repos.slice(skip);
		repos = repos.map((row) => row.repo);
		const progressBar = new progress.SingleBar(
			{},
			progress.Presets.shades_classic,
		);
		progressBar.start(repos.length, 0);

		for (const repo of repos) {
			speak.info(++index);

			const response = await fetchRepoDirectCollaborators(repo, options);
			console.log(JSON.stringify(response, null, 2));
			console.log({ repo });
			let status = response.status;
			let statusText = response.statusText;
			let errorMessage = response.errorMessage;

			if (response.data) {
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

					(status = SUCCESS_STATUS), (statusText = '');
					errorMessage = '';
					stringifier.write({ repo, login, role });
				}
			}

			statusStringifier.write({ repo, status, statusText, errorMessage });
			progressBar.increment();
			await delay(waitTime);
		}

		stringifier.end();
		speak.success(
			`Successfully saved repositories direct collaborators to ${outputFileName}`,
		);
		progressBar.stop();
	} catch (error) {
		speak.error(error);
		speak.error('Failed to get repositories direct collaborators');
	}
};

export default exportGithubRepoDirectCollaborators;
