#!/usr/bin/env node

import {
	doRequest,
	getStringifier,
	currentTime,
	delay,
} from '../../../../services/utils.js';

const processRepositories = (values, stringifier) => {
	for (const value of values) {
		const { name, description, is_private, links } = value;

		for (const clone of links.clone) {
			if (clone.name === 'https') {
				const row = {
					repo: name,
					description: description,
					url: clone.href,
					visibility: is_private ? 'private' : 'public',
				};

				stringifier.write(row);
			}
		}
	}
};
export { processRepositories };

const getRepositoriesConfig = (options, urlOpts) => {
	const { organization: project, token, batchSize, serverUrl } = options;
	const { nextPageStart } = urlOpts;
	let url = `${serverUrl}/repositories/${project}?limit=${batchSize}`;

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

const columns = ['repo', 'description', 'url', 'visibility'];
export { columns };

const exportBitbucketRepos = async (options) => {
	const { organization: project, outputFile, waitTime } = options;
	const outputFileName =
		(outputFile && outputFile.endsWith('.csv') && outputFile) ||
		`${project}-bitbucket-repo-${currentTime()}.csv`;
	const stringifier = getStringifier(outputFileName, columns);
	let reposInfo = await getRepositories(options, { nextPageStart: null });
	processRepositories(reposInfo.data.values, stringifier);
	await delay(waitTime);

	// while (!reposInfo.isLastPage) {
	// https://developer.atlassian.com/cloud/bitbucket/rest/intro/#pagination
	while (reposInfo.next) {
		reposInfo = await getRepositories(options, {
			nextPageStart: reposInfo.nextPageStart,
		});
		processRepositories(reposInfo.data.values, stringifier);
		await delay(waitTime);
	}

	stringifier.end();
};

export default exportBitbucketRepos;
