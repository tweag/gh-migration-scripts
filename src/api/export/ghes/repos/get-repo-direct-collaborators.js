#!/usr/bin/env node

import fs from 'node:fs';
import readline from 'node:readline';
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
import { getOutsideCollaborators } from '../users/get-outside-collaborators.js';

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

export const getReposDirectCollaborators = async (options) => {
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
			outsideCollaborators = await getOutsideCollaborators(options);
		}

		const fileStream = fs.createReadStream(inputFile);

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

			const rowArr = line.split(',');
			const repo = rowArr[0];
			console.log(++index);

			if (skip >= index) continue;

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
			await delay(waitTime);
		}

		stringifier.end();
	} catch (error) {
		console.error(error);
	}
};
