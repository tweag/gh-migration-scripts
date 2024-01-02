#!/usr/bin/env node

import {
	doRequest,
	getStringifier,
	currentTime,
	delay,
} from '../../../../services/utils.js';

const processTeams = (values, stringifier) => {
	for (const value of values) {
		const { id, name, path, description, parent_id, web_url: webUrl } = value;
		stringifier.write({
			id,
			name,
			slug: path,
			description,
			privacy: 'closed',
			parentTeam: parent_id ? webUrl.split('/').slice(-2)[0] : '',
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

const columns = ['id', 'name', 'slug', 'description', 'privacy', 'parentTeam'];

const getGitlabTeams = async (options) => {
	const { organization: org, outputFile, waitTime, batchSize } = options;
	const outputFileName =
		(outputFile && outputFile.endsWith('.csv') && outputFile) ||
		`${org}-gitlab-teams-${currentTime()}.csv`;
	const stringifier = getStringifier(outputFileName, columns);

	let { data: teamsInfo } = await getTeamsRequest(options, { idAfter: null });
	console.log(JSON.stringify(teamsInfo, null, 2));
	let teamsLength = teamsInfo.length;
	processTeams(teamsInfo, stringifier);
	await delay(waitTime);

	while (teamsLength == batchSize) {
		const { data } = await getTeamsRequest(options, {
			idAfter: teamsInfo[Number(batchSize) - 1].id,
		});
		teamsInfo = data;
		processTeams(teamsInfo, stringifier);
		teamsLength = teamsInfo.length;
		await delay(waitTime);
	}

	stringifier.end();
};

export default getGitlabTeams;
