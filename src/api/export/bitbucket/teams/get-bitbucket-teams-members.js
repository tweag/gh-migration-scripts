#!/usr/bin/env node

import {
	doRequest,
	getStringifier,
	currentTime,
	delay,
} from '../../../../services/utils.js';
import { BITBUCKET_CLOUD_API_URL } from '../../../../services/constants.js';

const processTeamMembers = (team, values, stringifier) => {
	for (const value of values) {
		const row = {
			user: value.nickname,
			team,
			role: 'maintainer',
		};
		stringifier.write(row);
	}
};

const getTeamMembersConfig = (options, team, cloudUrl) => {
	const { organization: org, token, batchSize } = options;

	return {
		method: 'get',
		maxBodyLength: Infinity,
		url: cloudUrl
			? cloudUrl
			: `${BITBUCKET_CLOUD_API_URL}/groups/${org}/${team}/members?pagelen=${batchSize}`,
		headers: {
			Accept: 'application/json',
			Authorization: `Bearer ${token}`,
		},
	};
};

const getTeamMembers = async (options, team, cloudUrl) => {
	const config = getTeamMembersConfig(options, team, cloudUrl);
	return doRequest(config);
};

const columns = ['user', 'team', 'role'];

const getBitbucketTeamsMembers = async (options) => {
	const { organization: org, inputFile, outputFile, waitTime } = options;
	const teams = (await getData(inputFile)).map((row) => row.team);
	const outputFileName =
		(outputFile && outputFile.endsWith('.csv') && outputFile) ||
		`${org}-bitbucket-team-members-${currentTime()}.csv`;
	const stringifier = getStringifier(outputFileName, columns);

	for (const team of teams) {
		let teamMembersInfo = await getTeamMembers(options, team);
		processTeamMembers(team, teamMembersInfo.values, stringifier);
		await delay(waitTime);

		while (teamMembersInfo.next) {
			teamMembersInfo = await getTeam(options, team, teamMembersInfo.next);
			processTeamMembers(team, teamMembersInfo.values, stringifier);
			await delay(waitTime);
		}
	}

	stringifier.end();
};

export default getBitbucketTeamsMembers;
