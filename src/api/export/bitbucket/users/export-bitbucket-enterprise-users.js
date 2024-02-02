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

const getEnterpriseUsersConfig = (options, urlOpts) => {
	const { token, batchSize, serverUrl } = options;
	const { nextPageStart } = urlOpts;
	let url = `${serverUrl}/rest/api/latest/admin/users?limit=${batchSize}`;

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

const getEnterpriseUsers = async (options, urlOpts) => {
	const config = getEnterpriseUsersConfig(options, urlOpts);
	return doRequest(config);
};

const columns = ['login'];

const exportBitbucketEnterpriseUsers = async (options) => {
	let users = [];
	const { organization: org, outputFile, waitTime } = options;
	const outputFileName =
		(outputFile && outputFile.endsWith('.csv') && outputFile) ||
		`${org}-bitbucket-enterprise-users-${currentTime()}.csv`;
	const stringifier = getStringifier(outputFileName, columns);
	let usersInfo = await getEnterpriseUsers(options, { nextPageStart: null });
	processUsers(usersInfo.values, stringifier);
	await delay(waitTime);

	while (!usersInfo.isLastPage) {
		usersInfo = await getEnterpriseUsers(options, {
			nextPageStart: usersInfo.nextPageStart,
		});
		processUsers(usersInfo.values, stringifier);
		await delay(waitTime);
	}

	stringifier.end();
	return users;
};

export default exportBitbucketEnterpriseUsers;
