#!/usr/bin/env node

import {
	doRequest,
	getStringifier,
	getData,
	currentTime,
	delay,
} from '../../../../services/utils.js';

const processReposTeamsPermissions = (repo, values, stringifier) => {
	for (const value of values) {
		const row = {
			repo,
			login: value.group.name,
			role: value.permission,
		};
		stringifier.write(row);
	}
};

const getReposTeamsPermissionsConfig = (options, urlOpts) => {
	const { organization: project, token, batchSize, serverUrl } = options;
	const { repo, nextPageStart } = urlOpts;
	let url = `${serverUrl}/rest/api/latest/projects/${project}/repos/${repo}/permissions/groups?limit=${batchSize}`;

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

const getReposTeamsPermissions = async (options, urlOpts) => {
	const config = getReposTeamsPermissionsConfig(options, urlOpts);
	return doRequest(config);
};

const columns = ['repo', 'team', 'permission'];

const getBitbucketReposTeamsPermissions = async (options) => {
	const { organization: project, inputFile, outputFile, waitTime } = options;
	const repos = (await getData(inputFile)).map((row) => row.repo);
	const outputFileName =
		(outputFile && outputFile.endsWith('.csv') && outputFile) ||
		`${project}-bitbucket-repos-teams-permissions-${currentTime()}.csv`;
	const stringifier = getStringifier(outputFileName, columns);

	for (const repo of repos) {
		let repoTeamsInfo = await getReposTeamsPermissions(options, { repo });
		processReposTeamsPermissions(repo, repoTeamsInfo.values, stringifier);
		await delay(waitTime);

		while (repoTeamsInfo.next) {
			repoTeamsInfo = await getReposTeamsPermissions(options, {
				repo,
				nextPageStart: repoTeamsInfo.nextPageStart,
			});
			processReposTeamsPermissions(repo, repoTeamsInfo.values, stringifier);
			await delay(waitTime);
		}
	}

	stringifier.end();
};

export default getBitbucketReposTeamsPermissions;
