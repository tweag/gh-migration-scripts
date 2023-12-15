#!/usr/bin/env node

import {
	doRequest,
	getStringifier,
	currentTime,
	delay,
} from '../../../../services/utils.js';
import { BITBUCKET_CLOUD_API_URL } from '../../../../services/constants.js';

const processRepositories = (repos, stringifier) => {
	for (const repo of repos) {
		const { slug, is_private, has_wiki, size } = repo;

		const row = {
			repo: slug,
			visibility: is_private ? 'private' : 'public',
			wikiEnabled: has_wiki ? 'enabled' : 'disabled',
			diskUsage: size,
		};

		stringifier.write(row);
	}
};

const getRepositoriesConfig = (options, cloudUrl) => {
	const { organization: org, token, batchSize } = options;

	return {
		method: 'get',
		maxBodyLength: Infinity,
		url: cloudUrl
			? cloudUrl
			: `${BITBUCKET_CLOUD_API_URL}/repositories/${org}?pagelen=${batchSize}`,
		headers: {
			Accept: 'application/json',
			Authorization: `Bearer ${token}`,
		},
	};
};

const getRepositories = async (options, url) => {
	const config = getRepositoriesConfig(options, url);
	return doRequest(config);
};

const columns = ['repo', 'visibility', 'wikiEnabled', 'diskUsage'];

const getBitbucketRepositories = async (options) => {
	const { organization: org, outputFile, waitTime } = options;
	const outputFileName =
		(outputFile && outputFile.endsWith('.csv') && outputFile) ||
		`${org}-bitbucket-repos-${currentTime()}.csv`;
	const stringifier = getStringifier(outputFileName, columns);
	let reposInfo = await getRepositories(options);
	processRepositories(reposInfo.values, stringifier);
	await delay(waitTime);

	while (reposInfo.next) {
		reposInfo = await getRepositories(options, reposInfo.next);
		processRepositories(reposInfo.values, stringifier);
		await delay(waitTime);
	}

	stringifier.end();
};

export default getBitbucketRepositories;
