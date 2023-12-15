#!/usr/bin/env node

import {
	delay,
	doRequest,
	getData,
	getStringifier,
	currentTime,
} from '../../../../services/utils.js';
import { GITHUB_API_URL } from '../../../../services/constants.js';

const getOutsideCollaboratorsConfig = (page, options) => {
	const { organization: org, githubUrl, token } = options;
	let url = `${GITHUB_API_URL}/orgs/${org}/outside_collaborators?per_page=100&page=${page}`;

	if (githubUrl) {
		url = `${githubUrl}/api/v3/orgs/${org}/outside_collaborators?per_page=100&page=${page}`;
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

const fetchOutsideCollaborators = async (page, options) => {
	const config = getOutsideCollaboratorsConfig(page, options);
	return doRequest(config);
};

export const getOutsideCollaborators = async (options) => {
	try {
		const { usersFile, organization: org, outputFile, waitTime } = options;
		let page = 1;
		let length = 0;
		const outsideCollaborators = [];
		const outputFileName =
			(outputFile && outputFile.endsWith('.csv') && outputFile) ||
			`${org}-outside-collaborators-${currentTime()}.csv`;
		const stringifier = getStringifier(outputFileName, ['login']);
		let enterpriseUsers = [];

		if (usersFile) {
			const usersData = await getData(usersFile);
			enterpriseUsers = usersData.map((row) => row.login.toLowerCase());
		}

		while (page === 1 || length === 100) {
			const response = await fetchOutsideCollaborators(page, options);
			console.log(JSON.stringify(response, null, 2));

			if (response.data) {
				const outsideCollaborators = response.data;
				length = outsideCollaborators.length;

				for (const user of outsideCollaborators) {
					let { login } = user;
					login = login.toLowerCase();

					if (enterpriseUsers.length > 0) {
						if (enterpriseUsers.includes(login)) {
							stringifier.write({ login });
							outsideCollaborators.push(login);
						}
					} else {
						stringifier.write({ login });
						outsideCollaborators.push(login);
					}
				}
			}

			page++;
			await delay(waitTime);
		}

		stringifier.end();

		return outsideCollaborators;
	} catch (error) {
		console.error(error);
	}
};
