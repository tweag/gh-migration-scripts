#!/usr/bin/env node

import {
	doRequest,
	getStringifier,
	currentTime,
	delay,
} from '../../../../services/utils.js';

const rolesMap = {
	50: 'admin',
	40: 'admin',
	30: 'write',
	20: 'read',
	10: 'triage',
};

const processRole = (role) => rolesMap[role];

const processReposDirectCollaborators = (repo, values, stringifier) => {
	for (const value of values) {
		const { username, access_level: accessLevel } = value;
		const row = {
			repo,
			login: username,
			role: processRole(accessLevel),
		};
		stringifier.write(row);
	}
};

const getReposDirectCollaboratorsConfig = (options, urlOpts) => {
	const { token, batchSize, serverUrl } = options;
	const { projectId, idAfter } = urlOpts;
	let url = `${serverUrl}/project/${projectId}/members/all?pagination=keyset&per_page=${batchSize}&order_by=id&sort=asc`;

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

const getReposDirectCollaborators = async (options, urlOpts) => {
	const config = getReposDirectCollaboratorsConfig(options, urlOpts);
	return doRequest(config);
};

const columns = ['repo', 'login', 'role'];

const getGitlabReposDirectCollaborators = async (options) => {
	const { organization: org, inputFile, outputFile, waitTime, batchSize } = options;
	const repos = await getData(inputFile);
	const outputFileName =
		(outputFile && outputFile.endsWith('.csv') && outputFile) ||
		`${org}-gitlab-repos-direct-collaborators-${currentTime()}.csv`;
	const stringifier = getStringifier(outputFileName, columns);

	for (const repo of repos) {
		let repoUsersInfo = await getReposDirectCollaborators(options, { repoId: repo.id });
		let reposLength = repoUsersInfo.length;
		processReposDirectCollaborators(repo, repoUsersInfo, stringifier);
		await delay(waitTime);

		while (reposLength === batchSize) {
			repoUsersInfo = await getReposDirectCollaborators(options, {
				repoId: repo.id,
				idAfter: repoUsersInfo[batchSize - 1].id,
			});
			processReposDirectCollaborators(repo, repoUsersInfo, stringifier);
			reposLength = repoUsersInfo.length;
			await delay(waitTime);
		}
	}

	stringifier.end();
};

export default getGitlabReposDirectCollaborators;
