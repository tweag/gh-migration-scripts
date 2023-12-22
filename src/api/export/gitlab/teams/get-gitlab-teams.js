#!/usr/bin/env node

import {
	doRequest,
	getStringifier,
	currentTime,
	delay,
} from '../../../../services/utils.js';

const processTeams = (values, stringifier) => {
	for (const value of values) {
		const { name, path, description, visibility, parent_id } = value;
		stringifier.write({
			name,
			slug: path,
			description,
			privacy: visibility === 'public' ? 'closed' : 'secret',
			parentTeam: parent_id,
		});
	}
};

const getTeams = (options, urlOpts) => {
	const { token, batchSize, serverUrl } = options;
	const { idAfter } = urlOpts;
	let url = `${serverUrl}/api/v4/groups?pagination=keyset&per_page=${batchSize}&order_by=id&sort=asc`;

	if (idAfter) url = url + `&id_after=${idAfter}`;

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

const getTeamsRequest = async (options, urlOpts) => {
	const config = getTeams(options, urlOpts);
	return doRequest(config);
};

const columns = ['name', 'slug', 'description', 'privacy', 'parentTeam'];

const getGitlabTeams = async (options) => {
	const { organization: org, outputFile, waitTime, batchSize } = options;
	const outputFileName =
		(outputFile && outputFile.endsWith('.csv') && outputFile) ||
		`${org}-gitlab-teams-${currentTime()}.csv`;
	const stringifier = getStringifier(outputFileName, columns);

	let teamsInfo = await getTeamsRequest(options, { idAfter: null });
	let teamsLength = teamsInfo.length;
	processTeams(teamsInfo, stringifier);
	await delay(waitTime);

	while (teamsLength === batchSize) {
		teamsInfo = await getTeamsRequest(options, {
			idAfter: teamsInfo[batchSize - 1].id,
		});
		processTeams(teamsInfo, stringifier);
		teamsLength = teamsInfo.length;
		await delay(waitTime);
	}

	stringifier.end();
};

export default getGitlabTeams;
