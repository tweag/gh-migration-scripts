#!/usr/bin/env node

import {
	doRequest,
	getStringifier,
	currentTime,
	delay,
} from '../../../../services/utils.js';

const processRepositories = (values, stringifier) => {
	for (const value of values) {
		const { name, archived } = value;

		const row = {
			repo: name,
			visibility: value.public ? 'public' : 'private',
			isArchived: archived ? true : false,
		};

		stringifier.write(row);
	}
};

const getRepositoriesConfig = (options, urlOpts) => {
	const { organization: project, token, batchSize, serverUrl } = options;
	const { nextPageStart } = urlOpts;
	let url = `${serverUrl}/rest/api/latest/projects/${project}/repos?limit=${batchSize}`;

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

const getRepositories = async (options, urlOpts) => {
	const config = getRepositoriesConfig(options, urlOpts);
	return doRequest(config);
};

const columns = ['repo', 'isArchived', 'visibility'];

const getBitbucketRepositories = async (options) => {
	const { organization: project, outputFile, waitTime } = options;
	const outputFileName =
		(outputFile && outputFile.endsWith('.csv') && outputFile) ||
		`${project}-bitbucket-repo-${currentTime()}.csv`;
	const stringifier = getStringifier(outputFileName, columns);
	let reposInfo = await getRepositories(options, { nextPageStart: null });
	processRepositories(reposInfo.values, stringifier);
	await delay(waitTime);

	while (!reposInfo.isLastPage) {
		reposInfo = await getRepositories(options, {
			nextPageStart: reposInfo.nextPageStart,
		});
		processRepositories(reposInfo.values, stringifier);
		await delay(waitTime);
	}

	stringifier.end();
};

export default getBitbucketRepositories;
