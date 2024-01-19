#!/usr/bin/env node

import progress from 'cli-progress';
import {
	getData,
	getStringifier,
	doRequest,
	delay,
	currentTime,
} from '../../../../services/utils.js';
import { getTeam } from '../../../export/ghes/teams/get-team.js';
import {
	GITHUB_API_URL,
	SUCCESS_STATUS,
	VALIDATION_FAILED,
} from '../../../../services/constants.js';

const getCreateTeamConfig = ({
	name,
	description,
	privacy,
	parentTeamId,
	options,
}) => {
	const { organization: org, serverUrl, token } = options;
	let url = `${GITHUB_API_URL}/orgs/${org}/teams`;

	if (serverUrl) {
		url = `${serverUrl}/api/v3/orgs/${org}/teams`;
	}

	const paramsData = {
		org,
		name,
		description,
		privacy,
	};

	if (parentTeamId) paramsData.parent_team_id = parentTeamId;

	return {
		method: 'post',
		maxBodyLength: Infinity,
		url,
		data: JSON.stringify(paramsData),
		headers: {
			Accept: 'application/vnd.github+json',
			Authorization: `Bearer ${token}`,
		},
	};
};

export const createSingleTeam = async (details) => {
	const config = getCreateTeamConfig(details);
	return doRequest(config);
};

export const deleteMemberFromTeam = async (slug, member, options) => {
	const { organization: org, serverUrl, token } = options;
	let url = `${GITHUB_API_URL}/orgs/${org}/teams/${slug}/memberships/${member}`;

	if (serverUrl) {
		url = `${serverUrl}/api/v3/orgs/${org}/teams/${slug}/memberships/${member}`;
	}

	const config = {
		method: 'delete',
		maxBodyLength: Infinity,
		url,
		headers: {
			Accept: 'application/vnd.github+json',
			Authorization: `Bearer ${token}`,
		},
	};

	return doRequest(config);
};

const importGithubTeams = async (options) => {
	try {
		const { inputFile, organization: org, outputFile, skip } = options;

		const outputFileName =
			(outputFile && outputFile.endsWith('.csv') && outputFile) ||
			`${org}-create-teams-status-${currentTime()}.csv`;
		const columns = ['team', 'status', 'statusText', 'errorMessage'];
		const stringifier = getStringifier(outputFileName, columns);
		let teams = await getData(inputFile);
		teams = teams.slice(skip);
		const progressBar = new progress.SingleBar(
			{},
			progress.Presets.shades_classic,
		);
		progressBar.start(teams.length, 0);

		let index = 0;

		for (const team of teams) {
			console.log(++index);

			const { parentTeam } = team;
			let parentTeamId;

			if (parentTeam) {
				const parentTeamData = await getTeam(parentTeam, options);

				if (parentTeamData.status !== 404) {
					parentTeamId = parentTeamData.data.id;
				} else {
					const parentTeamFound = teams.find(
						(item) => item.slug === parentTeam,
					);
					const { id } = await createOperations(
						options,
						parentTeamFound,
						null,
						stringifier,
					);
					parentTeamId = id;
				}
			}

			progressBar.increment();
			await createOperations(options, team, parentTeamId, stringifier);
		}

		progressBar.stop();
		stringifier.end();
	} catch (error) {
		console.error(error);
	}
};

export const createOperations = async (
	options,
	team,
	parentTeamId,
	stringifier,
) => {
	const { waitTime, githubUser } = options;
	const { name, description, privacy } = team;

	const response = await createSingleTeam({
		name,
		description,
		privacy: privacy === 'VISIBLE' ? 'closed' : 'secret',
		parentTeamId,
		options,
	});

	console.log(response);
	console.log({ team: name });
	let status = response.status;
	let statusText = response.statusText;
	let errorMessage = response.errorMessage;
	let teamId;

	if (status === 422 && errorMessage === VALIDATION_FAILED) return;

	if (response.data) {
		const deleteResponse = await deleteMemberFromTeam(
			response.data.slug,
			githubUser,
			options,
		);
		console.log(
			`Delete member response: ${JSON.stringify(deleteResponse, null, 2)}`,
		);

		status = SUCCESS_STATUS;
		statusText = '';
		errorMessage = '';
		teamId = response.data.id;
	}

	stringifier.write({ team: name, status, statusText, errorMessage });
	await delay(waitTime);

	return { id: teamId };
};

export default importGithubTeams;
