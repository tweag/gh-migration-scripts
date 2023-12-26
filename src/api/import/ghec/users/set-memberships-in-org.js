#!/usr/bin/env node

import {
	doRequest,
	delay,
	getData,
	getStringifier,
	currentTime,
} from '../../../../services/utils.js';
import {
	GITHUB_API_URL,
	SUCCESS_STATUS,
} from '../../../../services/constants.js';

const getMembershipConfig = (login, options) => {
	const { organization: org, serverUrl, token, deleteMembers } = options;
	let url = `${GITHUB_API_URL}/orgs/${org}/memberships/${login}`;

	if (serverUrl) {
		url = `${serverUrl}/api/v3/orgs/${org}/memberships/${login}`;
	}

	const config = {
		method: deleteMembers ? 'delete' : 'put',
		maxBodyLength: Infinity,
		url,
		headers: {
			Accept: 'application/vnd.github+json',
			Authorization: `Bearer ${token}`,
		},
	};

	if (!deleteMembers) {
		config.data = JSON.stringify({ role: 'member' });
	}

	return config;
};

const setMembership = async (login, options) => {
	const config = getMembershipConfig(login, options);
	return doRequest(config);
};

export const setMembershipInOrg = async (options) => {
	try {
		const { inputFile, organization: org, outputFile, waitTime, skip } = options;
		const outputFileName =
			(outputFile && outputFile.endsWith('.csv') && outputFile) ||
			`${org}-set-membership-status-${currentTime()}.csv`;
		const columns = ['login', 'status', 'statusText', 'errorMessage'];
		const stringifier = getStringifier(outputFileName, columns);
		const members = await getData(inputFile);
		let index = 0;

		for (const member of members) {
			console.log(++index);

			if (skip > index) continue;

			const { login } = member;
			const response = await setMembership(login, options);
			console.log(JSON.stringify(response, null, 2));
			console.log({ login });

			let status = SUCCESS_STATUS;
			let statusText = '';
			let errorMessage = '';

			if (!response.data) {
				status = response.status;
				statusText = response.statusText;
				errorMessage = response.errorMessage;
			}

			stringifier.write({ login, status, statusText, errorMessage });
			await delay(waitTime);
		}
	} catch (error) {
		console.error(error);
	}
};
