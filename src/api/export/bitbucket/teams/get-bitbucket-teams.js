#!/usr/bin/env node

import {
	doRequest,
	getStringifier,
	currentTime,
	delay,
} from '../../../../services/utils.js';

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
	const { organization: project, token, batchSize, serverUrl } = options;
	const { nextPageStart } = urlOpts;
	let url = `${serverUrl}/rest/api/latest/projects/${project}/permissions/groups?limit=${batchSize}`;

	if (nextPageStart) url = url + `&start=${nextPageStart}`;

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

	let teamsInfo = await getTeams(options, { nextPageStart: null });
	processTeams(teamsInfo.values, stringifier);
	await delay(waitTime);

	while (!teamsInfo.isLastPage) {
		teamsInfo = await getTeams(options, {
			nextPageStart: teamsInfo.nextPageStart,
		});
		processTeams(teamsInfo.values, stringifier);
		await delay(waitTime);
	}

	stringifier.end();
};

export default getBitbucketTeams;
