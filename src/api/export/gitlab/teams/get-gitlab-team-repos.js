#!/usr/bin/env node

import {
	doRequest,
	getStringifier,
	currentTime,
	delay,
} from '../../../../services/utils.js';

const processTeamRepositories = (team, values, stringifier) => {
	for (const value of values) {
		const row = {
			repo: value.path,
			team,
			permission: 'admin',
		};
		stringifier.write(row);
	}
};

const getTeamRepositoriesConfig = (options, urlOpts) => {
	const { token, batchSize, serverUrl } = options;
	const { groupId, idAfter } = urlOpts;
	let url = `${serverUrl}/api/v4/groups/${groupId}/projects?pagination=keyset&per_page=${batchSize}&order_by=id&sort=asc`;

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

const getTeamRepositories = async (options, urlOpts) => {
	const config = getTeamRepositoriesConfig(options, urlOpts);
	return doRequest(config);
};

const columns = ['repo', 'team', 'permission'];

const getGitlabTeamsRepositories = async (options) => {
	const { organization: org, inputFile, outputFile, waitTime, batchSize } = options;
	const teamsData = (await getData(inputFile));
	const teams = teamsData.map(teamData => {
		return {
			team: teamData.team,
			id: teamData.id,
		};
	});
	const outputFileName =
		(outputFile && outputFile.endsWith('.csv') && outputFile) ||
		`${org}-gitlab-teams-repos-${currentTime()}.csv`;
	const stringifier = getStringifier(outputFileName, columns);

	for (const team of teams) {
		let teamReposInfo = await getTeamRepositories(options, { teamId: team.id });
		let reposLength = teamReposInfo.length;
		processTeamRepositories(team, teamReposInfo, stringifier);
		await delay(waitTime);

		while (reposLength === batchSize) {
			teamReposInfo = await getTeamRepositories(options, {
				teamId: team.id,
				idAfter: teamReposInfo[batchSize - 1].id,
			});
			processTeamRepositories(team.team, teamReposInfo, stringifier);
			reposLength = teamReposInfo.length;
			await delay(waitTime);
		}
	}

	stringifier.end();
};

export default getGitlabTeamsRepositories;
