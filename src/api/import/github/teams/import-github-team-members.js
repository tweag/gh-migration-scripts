#!/usr/bin/env node

import progress from 'cli-progress';
import {
	getData,
	getStringifier,
	doRequest,
	delay,
	currentTime,
} from '../../../../services/utils.js';
import {
	GITHUB_API_URL,
	SUCCESS_STATUS,
} from '../../../../services/constants.js';

const columns = [
	'member',
	'team',
	'role',
	'status',
	'statusText',
	'errorMessage',
];

const getInsertTeamMembersConfig = ({ member, team, role, options }) => {
	const { organization: org, serverUrl, token } = options;
	let url = `${GITHUB_API_URL}/orgs/${org}/teams/${team}/memberships/${member}`;

	if (serverUrl) {
		url = `${serverUrl}/api/v3/orgs/${org}/teams/${team}/memberships/${member}`;
	}

	return {
		method: 'put',
		maxBodyLength: Infinity,
		url,
		data: JSON.stringify({ role }),
		headers: {
			Accept: 'application/vnd.github+json',
			Authorization: `Bearer ${token}`,
		},
	};
};

const insertTeamMember = async (details) => {
	const config = getInsertTeamMembersConfig(details);
	return doRequest(config);
};

const importGithubTeamMembers = async (options) => {
	try {
		const {
			inputFile,
			organization: org,
			outputFile,
			waitTime,
			skip,
		} = options;
		const outputFileName =
			(outputFile && outputFile.endsWith('.csv') && outputFile) ||
			`${org}-insert-team-members-status-${currentTime()}.csv`;

		const stringifier = getStringifier(outputFileName, columns);
		let rows = await getData(inputFile);
		rows = rows.slice(skip);
		const progressBar = new progress.SingleBar(
			{},
			progress.Presets.shades_classic,
		);
		progressBar.start(rows.length, 0);
		let index = 0;

		for (const row of rows) {
			progressBar.increment();
			console.log(++index);

			const { member, team, role } = row;
			console.log(JSON.stringify(row, null, 2));
			const response = await insertTeamMember({
				member,
				team,
				role,
				options,
			});

			console.log(JSON.stringify(response, null, 2));
			console.log({ member, team, role });

			let status = SUCCESS_STATUS;
			let statusText = '';
			let errorMessage = '';

			if (!response.data) {
				status = response.status;
				statusText = response.statusText;
				errorMessage = response.errorMessage;
			}

			stringifier.write({
				member,
				team,
				role,
				status,
				statusText,
				errorMessage,
			});
			await delay(waitTime);
		}

		progressBar.stop();
		stringifier.end();
	} catch (error) {
		console.error(error);
	}
};

export default importGithubTeamMembers;
