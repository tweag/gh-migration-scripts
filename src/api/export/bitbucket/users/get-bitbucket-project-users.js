#!/usr/bin/env node

import {
	doRequest,
	getStringifier,
	currentTime,
	delay,
} from '../../../../services/utils.js';

const processUsers = (values, stringifier) => {
	for (const value of values) {
		stringifier.write({ login: value.user.slug });
	}
};

const getProjectUsersConfig = (options, urlOpts) => {
	const { organization: project, token, batchSize, serverUrl } = options;
	const { nextPageStart } = urlOpts;
	let url = `${serverUrl}/rest/api/latest/projects/${project}/permissions/users?limit=${batchSize}`;

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

const getProjectUsers = async (options, urlOpts) => {
	const config = getProjectUsersConfig(options, urlOpts);
	return doRequest(config);
};

const columns = ['login'];

const getBitbucketProjectUsers = async (options) => {
	let users = [];
	const { organization: org, outputFile, waitTime } = options;
	const outputFileName =
		(outputFile && outputFile.endsWith('.csv') && outputFile) ||
		`${org}-bitbucket-organization-users-${currentTime()}.csv`;
	const stringifier = getStringifier(outputFileName, columns);
	let usersInfo = await getProjectUsers(options, { nextPageStart: null });
	processUsers(usersInfo.values, stringifier);
	await delay(waitTime);

	while (!usersInfo.isLastPage) {
		usersInfo = await getProjectUsers(options, {
			nextPageStart: usersInfo.nextPageStart,
		});
		processUsers(usersInfo.values, stringifier);
		await delay(waitTime);
	}

	stringifier.end();
	return users;
};

export default getBitbucketProjectUsers;
