#!/usr/bin/env node

import {
	doRequest,
	getStringifier,
	currentTime,
	delay,
} from '../../../../services/utils.js';

const processTeamMembers = (team, values, stringifier) => {
	for (const value of values) {
		const row = {
			user: value.slug,
			team,
			role: 'maintainer',
		};
		stringifier.write(row);
	}
};

const getTeamMembersConfig = (options, urlOpts) => {
	const { token, batchSize, serverUrl } = options;
	const { team, nextPageStart } = urlOpts;
	let url = `${serverUrl}/rest/api/latest/admin/groups/more-members?context=${team}&limit=${batchSize}`;

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

const getTeamMembers = async (options, urlOpts) => {
	const config = getTeamMembersConfig(options, urlOpts);
	return doRequest(config);
};

const columns = ['member', 'team', 'role'];

const getBitbucketTeamMembers = async (options) => {
	const { organization: org, inputFile, outputFile, waitTime } = options;
	const teams = (await getData(inputFile)).map((row) => row.team);
	const outputFileName =
		(outputFile && outputFile.endsWith('.csv') && outputFile) ||
		`${org}-bitbucket-team-members-${currentTime()}.csv`;
	const stringifier = getStringifier(outputFileName, columns);

	for (const team of teams) {
		let teamMembersInfo = await getTeamMembers(options, { team });
		processTeamMembers(team, teamMembersInfo.values, stringifier);
		await delay(waitTime);

		while (!teamsInfo.isLastPage) {
			teamMembersInfo = await getTeam(options, {
				team,
				nextPageStart: teamsInfo.nextPageStart,
			});
			processTeamMembers(team, teamMembersInfo.values, stringifier);
			await delay(waitTime);
		}
	}

	stringifier.end();
};

export default getBitbucketTeamMembers;
