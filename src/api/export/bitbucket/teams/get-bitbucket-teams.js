#!/usr/bin/env node

import {
	doRequest,
	getStringifier,
	currentTime,
	delay,
} from '../../../../services/utils.js';
import { BITBUCKET_CLOUD_API_URL } from '../../../../services/constants.js';

const processTeams = (values, stringifier) => {
	for (const value of values) {
		const row = {
			name: value.name,
			slug: value.slug,
			privacy: 'closed',
			description: '',
			parentTeam: null,
		};
		stringifier.write(row);
	}
};

const getTeamsConfig = (options, cloudUrl) => {
	const { organization: org, token, batchSize } = options;

	return {
		method: 'get',
		maxBodyLength: Infinity,
		url: cloudUrl
			? cloudUrl
			: `${BITBUCKET_CLOUD_API_URL}/groups/${org}?pagelen=${batchSize}`,
		headers: {
			Accept: 'application/json',
			Authorization: `Bearer ${token}`,
		},
	};
};

const getTeams = async (options, cloudUrl) => {
	const config = getTeamsConfig(options, cloudUrl);
	return doRequest(config);
};

const columns = ['name', 'slug', 'privacy', 'description', 'parentTeam'];

const getBitbucketTeams = async (options) => {
	const { organization: org, outputFile, waitTime } = options;
	const outputFileName =
		(outputFile && outputFile.endsWith('.csv') && outputFile) ||
		`${org}-bitbucket-teams-${currentTime()}.csv`;
	const stringifier = getStringifier(outputFileName, columns);

	let teamsInfo = await getTeams(options);
	processTeams(teamsInfo.values, stringifier);
	await delay(waitTime);

	while (teamsInfo.next) {
		teamsInfo = await getTeams(options, teamsInfo.next);
		processTeams(teamsInfo.values, stringifier);
		await delay(waitTime);
	}

	stringifier.end();
};

export default getBitbucketTeams;
