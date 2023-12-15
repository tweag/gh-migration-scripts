#!/usr/bin/env node

import {
	doRequest,
	getStringifier,
	currentTime,
	delay,
} from '../../../../services/utils.js';
import { BITBUCKET_CLOUD_API_URL } from '../../../../services/constants.js';

const processReposDirectCollaborators = (usersInfo, stringifier) => {
	const users = [];

	for (const userInfo of usersInfo) {
		const nickname = userInfo.user.nickname;
		users.push(nickname);
		stringifier.write({ login: nickname });
	}

	return users;
};

const getOrganizationMembersConfig = (options, cloudUrl) => {
	const { organization: org, token, batchSize } = options;

	return {
		method: 'get',
		maxBodyLength: Infinity,
		url: cloudUrl
			? cloudUrl
			: `${BITBUCKET_CLOUD_API_URL}/workspaces/${org}/members?pagelen=${batchSize}`,
		headers: {
			Accept: 'application/json',
			Authorization: `Bearer ${token}`,
		},
	};
};

const getOrganizationMembers = async (options, cloudUrl) => {
	const config = getOrganizationMembersConfig(options, cloudUrl);
	return doRequest(config);
};

const columns = ['repo', 'login', 'role'];

const getBitbucketOrganizationMembers = async (options) => {
	let users = [];
	const { organization: org, outputFile, waitTime } = options;
	const outputFileName =
		(outputFile && outputFile.endsWith('.csv') && outputFile) ||
		`${org}-bitbucket-cloud-organization-users-${currentTime()}.csv`;
	const stringifier = getStringifier(outputFileName, columns);
	let usersInfo = await getOrganizationMembers(options);
	users = [
		...users,
		...processReposDirectCollaborators(usersInfo.values, stringifier),
	];
	await delay(waitTime);

	while (usersInfo.next) {
		usersInfo = await getOrganizationMembers(options, usersInfo.next);
		users = [
			...users,
			...processReposDirectCollaborators(usersInfo.values, stringifier),
		];
		await delay(waitTime);
	}

	stringifier.end();
	return users;
};

export default getBitbucketOrganizationMembers;
