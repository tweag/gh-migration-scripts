#!/usr/bin/env node

import {
	doRequest,
	getStringifier,
	getData,
	currentTime,
	delay,
} from '../../../../services/utils.js';
import { BITBUCKET_CLOUD_API_URL } from '../../../../services/constants.js';

const processReposTeamsPermissions = (repo, values, stringifier) => {
	for (const value of values) {
		const row = {
			repo,
			login: value.group.slug,
			role: value.permission,
		};
		stringifier.write(row);
	}
};

const getReposTeamsPermissionsConfig = (options, repo, cloudUrl) => {
	const { organization: org, token, batchSize } = options;

	return {
		method: 'get',
		maxBodyLength: Infinity,
		url: cloudUrl
			? cloudUrl
			: `${BITBUCKET_CLOUD_API_URL}/repositories/${org}/${repo}/permissions-config/groups?pagelen=${batchSize}`,
		headers: {
			Accept: 'application/json',
			Authorization: `Bearer ${token}`,
		},
	};
};

const getReposTeamsPermissions = async (options, repo, cloudUrl) => {
	const config = getReposTeamsPermissionsConfig(options, repo, cloudUrl);
	return doRequest(config);
};

const columns = ['repo', 'team', 'permission'];

const getBitbucketReposTeamsPermissions = async (options) => {
	const { organization: org, inputFile, outputFile, waitTime } = options;
	const repos = (await getData(inputFile)).map((row) => row.repo);
	const outputFileName =
		(outputFile && outputFile.endsWith('.csv') && outputFile) ||
		`${org}-bitbucket-repos-teams-permissions-${currentTime()}.csv`;
	const stringifier = getStringifier(outputFileName, columns);

	for (const repo of repos) {
		let repoTeamsInfo = await getReposTeamsPermissions(options, repo);
		processReposTeamsPermissions(repo, repoTeamsInfo.values, stringifier);
		await delay(waitTime);

		while (repoTeamsInfo.next) {
			repoTeamsInfo = await getReposTeamsPermissions(
				options,
				repo,
				repoTeamsInfo.next,
			);
			processReposTeamsPermissions(repo, repoTeamsInfo.values, stringifier);
			await delay(waitTime);
		}
	}

	stringifier.end();
};

export default getBitbucketReposTeamsPermissions;
