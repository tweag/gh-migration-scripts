#!/usr/bin/env node

import {
	doRequest,
	getStringifier,
	currentTime,
	delay,
} from '../../../../services/utils.js';

const processUsers = (values, stringifier) => {
	for (const value of values) {
		const { username } = value;
		stringifier.write({ login: username });
	}
};

const getUsers = (options, urlOpts) => {
	const { token, batchSize, serverUrl } = options;
	const { idAfter } = urlOpts;
	let url = `${serverUrl}/api/v4/users?pagination=keyset&per_page=${batchSize}&order_by=id&sort=asc`;

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

const getUsersRequest = async (options, urlOpts) => {
	const config = getUsers(options, urlOpts);
	return doRequest(config);
};

const columns = ['login'];

const getOutputFileName = (outputFile, org) => {
	if (outputFile && outputFile.endsWith('.csv')) return outputFile;
	return `${org}-gitlab-users-${currentTime()}.csv`;
};

const getGitlabUsers = async (options) => {
	const { organization: org, outputFile, waitTime, batchSize } = options;
	const outputFileName = getOutputFileName(outputFile, org);
	const stringifier = getStringifier(outputFileName, columns);

	let { data: usersInfo } = await getUsersRequest(options, { idAfter: null });
	let usersLength = usersInfo.length;
	processUsers(usersInfo, stringifier);
	await delay(waitTime);

	while (usersLength == batchSize) {
		const { data } = await getUsersRequest(options, {
			idAfter: usersInfo[Number(batchSize) - 1].id,
		});
		usersInfo = data;
		processUsers(usersInfo, stringifier);
		usersLength = usersInfo.length;
		await delay(waitTime);
	}

	stringifier.end();
};

export default getGitlabUsers;
