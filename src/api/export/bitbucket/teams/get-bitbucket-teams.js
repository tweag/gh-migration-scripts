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

const getTeamsConfig = (options, urlOpts) => {
	const { organization: org, token, batchSize, bitbucketUrl } = options;
	const { next, nextPageStart } = urlOpts;
	let url = next ? next : `${BITBUCKET_CLOUD_API_URL}/groups/${org}?pagelen=${batchSize}`;

	if (bitbucketUrl) {
		if (nextPageStart) {
			url = `${bitbucketUrl}/rest/api/latest/admin/groups?start=${nextPageStart}&limit=${batchSize}`;
		} else {
			url = `${bitbucketUrl}/rest/api/latest/admin/groups?limit=${batchSize}`;
		}
	}
	return {
		method: 'get',
		maxBodyLength: Infinity,
		url,
		headers: {
			Accept: 'application/json',
			Authorization: `Bearer ${token}`,
		},
	};
};

const getTeams = async (options, urlOpts) => {
	const config = getTeamsConfig(options, urlOpts);
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

	while (teamsInfo.next || !teamsInfo.isLastPage) {
		teamsInfo = await getTeams(options, { next: teamsInfo.next, nextPageStart: teamsInfo.nextPageStart });
		processTeams(teamsInfo.values, stringifier);
		await delay(waitTime);
	}

	stringifier.end();
};

export default getBitbucketTeams;
