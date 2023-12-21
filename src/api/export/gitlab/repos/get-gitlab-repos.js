#!/usr/bin/env node

import {
	doRequest,
	getStringifier,
	currentTime,
	delay,
} from '../../../../services/utils.js';

const processRepositories = (values, stringifier) => {
	for (const value of values) {
		const { name, id, archived, visibility } = value;

		const row = {
			repo: name,
      id,
			visibility,
			isArchived: archived ? true : false,
		};

		stringifier.write(row);
	}
};

const getRepositoriesConfig = (options, urlOpts) => {
	const { token, batchSize, serverUrl } = options;
	const { idAfter } = urlOpts;
	let url = `${serverUrl}/api/v4/projects?pagination=keyset&per_page=${batchSize}&order_by=id&sort=asc`;

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

const getRepositories = async (options, urlOpts) => {
	const config = getRepositoriesConfig(options, urlOpts);
	return doRequest(config);
};

const columns = ['repo', 'id', 'isArchived', 'visibility'];

const getGitlabRepositories = async (options) => {
	const { organization: org, outputFile, waitTime, batchSize } = options;
	const outputFileName =
		(outputFile && outputFile.endsWith('.csv') && outputFile) ||
		`${org}-gitlab-repos-${currentTime()}.csv`;
	const stringifier = getStringifier(outputFileName, columns);
	let reposInfo = await getRepositories(options, { idAfter: null });
  let reposLength = reposInfo.length;
	processRepositories(reposInfo, stringifier);
	await delay(waitTime);

	while (reposLength === batchSize) {
		reposInfo = await getRepositories(options, {
			idAfter: reposInfo[batchSize - 1].id,
		});
		processRepositories(reposInfo, stringifier);
    reposLength = reposInfo.length;
		await delay(waitTime);
	}

	stringifier.end();
};

export default getGitlabRepositories;
