#!/usr/bin/env node

import progress from 'cli-progress';
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

const exportBitbucketTeamMembers = async (options) => {
	const { organization: org, inputFile, outputFile, waitTime, skip } = options;
	const teams = (await getData(inputFile))
		.map((row) => row.team)
		.slice(Number(skip));
	const progressBar = new progress.SingleBar(
		{},
		progress.Presets.shades_classic,
	);
	progressBar.start(teams.length, 0);

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

		progressBar.increment();
	}

	progressBar.stop();
	stringifier.end();
};

export default exportBitbucketTeamMembers;
