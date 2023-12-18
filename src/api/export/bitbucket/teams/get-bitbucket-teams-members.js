#!/usr/bin/env node

import {
	doRequest,
	getStringifier,
	currentTime,
	delay,
} from '../../../../services/utils.js';
import { BITBUCKET_CLOUD_API_URL } from '../../../../services/constants.js';

const processTeamMembers = (team, values, stringifier, isServer) => {
	for (const value of values) {
		const row = {
			user: isServer ? value.slug : value.nickname,
			team,
			role: 'maintainer',
		};
		stringifier.write(row);
	}
};

const getTeamMembersConfig = (options, urlOpts) => {
	const { organization: org, token, batchSize, bitbucketUrl } = options;
	const { team, next, nextPageStart } = urlOpts;
	let url = next ? next : `${BITBUCKET_CLOUD_API_URL}/groups/${org}/${team}/members?pagelen=${batchSize}`;

	if (bitbucketUrl) {
		if (nextPageStart) {
			url = `${bitbucketUrl}/rest/api/latest/admin/groups/more-members?context=${team}&start=${nextPageStart}&limit=${batchSize}`;
		} else {
			url = `${bitbucketUrl}/rest/api/latest/admin/groups/more-members?context=${team}&limit=${batchSize}`;
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

const getTeamMembers = async (options, urlOpts) => {
	const config = getTeamMembersConfig(options, urlOpts);
	return doRequest(config);
};

const columns = ['user', 'team', 'role'];

const getBitbucketTeamsMembers = async (options) => {
	const { organization: org, inputFile, outputFile, waitTime, bitbucketUrl } = options;
	const teams = (await getData(inputFile)).map((row) => row.team);
	const outputFileName =
		(outputFile && outputFile.endsWith('.csv') && outputFile) ||
		`${org}-bitbucket-team-members-${currentTime()}.csv`;
	const stringifier = getStringifier(outputFileName, columns);

	for (const team of teams) {
		let teamMembersInfo = await getTeamMembers(options, team);
		processTeamMembers(team, teamMembersInfo.values, stringifier, bitbucketUrl);
		await delay(waitTime);

		while (teamMembersInfo.next || !teamsInfo.isLastPage) {
			teamMembersInfo = await getTeam(options, { team, next: teamsInfo.next, nextPageStart: teamsInfo.nextPageStart });
			processTeamMembers(team, teamMembersInfo.values, stringifier, bitbucketUrl);
			await delay(waitTime);
		}
	}

	stringifier.end();
};

export default getBitbucketTeamsMembers;
