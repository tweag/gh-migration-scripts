#!/usr/bin/env node

import {
	doRequest,
	getStringifier,
	currentTime,
	delay,
} from '../../../../services/utils.js';
import { BITBUCKET_CLOUD_API_URL } from '../../../../services/constants.js';

const processReposDirectCollaborators = (repo, values, stringifier) => {
	for (const value of values) {
		const row = {
			repo,
			login: value.user.nickname,
			role: value.permission,
		};
		stringifier.write(row);
	}
};

const getReposDirectCollaboratorsConfig = (options, repo, cloudUrl) => {
	const { organization: org, token, batchSize } = options;

	return {
		method: 'get',
		maxBodyLength: Infinity,
		url: cloudUrl
			? cloudUrl
			: `${BITBUCKET_CLOUD_API_URL}/repositories/${org}/${repo}/permissions-config/users?pagelen=${batchSize}`,
		headers: {
			Accept: 'application/json',
			Authorization: `Bearer ${token}`,
		},
	};
};

const getReposDirectCollaborators = async (options, repo, cloudUrl) => {
	const config = getReposDirectCollaboratorsConfig(options, repo, cloudUrl);
	return doRequest(config);
};

const columns = ['repo', 'login', 'role'];

const getBitbucketReposDirectCollaborators = async (options) => {
	const { organization: org, inputFile, outputFile, waitTime } = options;
	const repos = (await getData(inputFile)).map((row) => row.repo);
	const outputFileName =
		(outputFile && outputFile.endsWith('.csv') && outputFile) ||
		`${org}-bitbucket-repos-direct-collaborators-${currentTime()}.csv`;
	const stringifier = getStringifier(outputFileName, columns);

	for (const repo of repos) {
		let repoUsersInfo = await getReposDirectCollaborators(options, repo);
		processReposDirectCollaborators(repo, repoUsersInfo.values, stringifier);
		await delay(waitTime);

		while (repoUsersInfo.next) {
			repoUsersInfo = await getReposDirectCollaborators(
				options,
				repo,
				repoUsersInfo.next,
			);
			processReposDirectCollaborators(repo, repoUsersInfo.values, stringifier);
			await delay(waitTime);
		}
	}

	stringifier.end();
};

export default getBitbucketReposDirectCollaborators;
