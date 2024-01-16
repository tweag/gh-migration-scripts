#!/usr/bin/env node

import {
	doRequest,
	getData,
	getStringifier,
	currentTime,
	delay,
} from '../../../../services/utils.js';

const rolesMap = {
	50: 'admin',
	40: 'admin',
	30: 'write',
	20: 'read',
	10: 'triage',
};

const processRole = (role) => rolesMap[role];

const processTeamMembers = (team, values, stringifier) => {
	for (const value of values) {
		const { username, access_level: accessLevel } = value;
		const row = {
			team,
			login: username,
			role: processRole(accessLevel),
		};
		stringifier.write(row);
	}
};

const getTeamMembersConfig = (options, urlOpts) => {
	const { token, batchSize, serverUrl } = options;
	const { teamId, idAfter } = urlOpts;
	let url = `${serverUrl}/api/v4/groups/${teamId}/members/all?pagination=keyset&per_page=${batchSize}&order_by=id&sort=asc`;

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

const getTeamMembers = async (options, urlOpts) => {
	const config = getTeamMembersConfig(options, urlOpts);
	return doRequest(config);
};

const columns = ['login', 'team', 'role'];

const exportGitlabTeamMembers = async (options) => {
	const {
		organization: org,
		inputFile,
		outputFile,
		waitTime,
		batchSize,
	} = options;
	const teams = await getData(inputFile);
	const outputFileName =
		(outputFile && outputFile.endsWith('.csv') && outputFile) ||
		`${org}-gitlab-teams-members-${currentTime()}.csv`;
	const stringifier = getStringifier(outputFileName, columns);

	for (const team of teams) {
		let { data: teamUsersInfo } = await getTeamMembers(options, {
			teamId: team.id,
		});
		let usersLength = teamUsersInfo.length;
		processTeamMembers(team.slug, teamUsersInfo, stringifier);
		await delay(waitTime);

		while (usersLength == batchSize) {
			const { data } = await getTeamMembers(options, {
				teamId: team.id,
				idAfter: teamUsersInfo[Number(batchSize) - 1].id,
			});
			teamUsersInfo = data;
			processTeamMembers(team.slug, teamUsersInfo, stringifier);
			usersLength = teamUsersInfo.length;
			await delay(waitTime);
		}
	}

	stringifier.end();
};

export default exportGitlabTeamMembers;
