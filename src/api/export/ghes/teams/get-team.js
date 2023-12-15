#!/usr/bin/env node

import { doRequest, delay } from '../../../../services/utils.js';
import { GITHUB_API_URL } from '../../../../services/constants.js';

const getTeamConfig = (team, options) => {
	const { organization: org, githubUrl, token } = options;
	let url = `${GITHUB_API_URL}/orgs/${org}/teams/${team}`;

	if (githubUrl) {
		url = `${githubUrl}/api/v3/orgs/${org}/teams/${team}`;
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

const fetchTeam = async (team, options) => {
	const config = getTeamConfig(team, options);
	return doRequest(config);
};

export const getTeam = async (team, options) => {
	await delay(options.waitTime);
	return fetchTeam(team, options);
};
