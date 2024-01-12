#!/usr/bin/env node

import {
	doRequest,
	getStringifier,
	currentTime,
	delay,
} from '../../../../services/utils.js';

const rolesMap = {
	USER_ADMIN: 'admin',
	PROJECT_VIEW: 'read',
	REPO_READ: 'read',
	REPO_WRITE: 'write',
	REPO_ADMIN: 'admin',
	PROJECT_READ: 'read',
	PROJECT_WRITE: 'write',
	REPO_CREATE: 'triage',
	PROJECT_ADMIN: 'admin',
	LICENSED_USER: 'read',
	PROJECT_CREATE: 'triage',
	ADMIN: 'admin',
	SYS_ADMIN: 'admin',
};

const processRole = (role) => rolesMap[role];

const processReposDirectCollaborators = (repo, values, stringifier) => {
	for (const value of values) {
		const { slug, permission } = value;
		const row = {
			repo,
			login: slug,
			role: processRole(permission),
		};
		stringifier.write(row);
	}
};

const getReposDirectCollaboratorsConfig = (options, urlOpts) => {
	const { organization: project, token, batchSize, serverUrl } = options;
	const { repo, nextPageStart } = urlOpts;
	let url = `${serverUrl}/rest/api/latest/projects/${project}/repos/${repo}/permissions/users?limit=${batchSize}`;

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

const getReposDirectCollaborators = async (options, urlOpts) => {
	const config = getReposDirectCollaboratorsConfig(options, urlOpts);
	return doRequest(config);
};

const columns = ['repo', 'login', 'role'];

const getBitbucketRepoDirectCollaborators = async (options) => {
	const { organization: org, inputFile, outputFile, waitTime } = options;
	const repos = (await getData(inputFile)).map((row) => row.repo);
	const outputFileName =
		(outputFile && outputFile.endsWith('.csv') && outputFile) ||
		`${org}-bitbucket-repo-direct-collaborators-${currentTime()}.csv`;
	const stringifier = getStringifier(outputFileName, columns);

	for (const repo of repos) {
		let repoUsersInfo = await getReposDirectCollaborators(options, { repo });
		processReposDirectCollaborators(repo, repoUsersInfo.values, stringifier);
		await delay(waitTime);

		while (!repoUsersInfo.isLastPage) {
			repoUsersInfo = await getReposDirectCollaborators(options, {
				repo,
				nextPageStart: repoUsersInfo.nextPageStart,
			});
			processReposDirectCollaborators(repo, repoUsersInfo.values, stringifier);
			await delay(waitTime);
		}
	}

	stringifier.end();
};

export default getBitbucketRepoDirectCollaborators;
