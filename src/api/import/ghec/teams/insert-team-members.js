#!/usr/bin/env node

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

export const insertTeamMembers = async (options) => {
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
		const columns = [
			'member',
			'team',
			'role',
			'status',
			'statusText',
			'errorMessage',
		];
		const stringifier = getStringifier(outputFileName, columns);
		const rows = await getData(inputFile);
		let index = 0;

		for (const row of rows) {
			console.log(++index);

			if (skip > index) continue;

			const { member, team, role } = row;
			console.log(JSON.stringify(row, null, 2));
			const response = await insertTeamMember({
				member,
				team,
				role: role.toLowerCase(),
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

		stringifier.end();
	} catch (error) {
		console.error(error);
	}
};
