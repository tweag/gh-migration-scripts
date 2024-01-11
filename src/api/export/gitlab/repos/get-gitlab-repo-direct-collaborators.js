#!/usr/bin/env node

import {
	doRequest,
	getData,
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
	const { repoId, idAfter } = urlOpts;
	let url = `${serverUrl}/api/v4/projects/${repoId}/members/all?pagination=keyset&per_page=${batchSize}&order_by=id&sort=asc`;

	if (idAfter) url = url + `&id_after=${idAfter}`;

	console.log({ url, token, batchSize, serverUrl });

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
	const {
		organization: org,
		inputFile,
		outputFile,
		waitTime,
		batchSize,
	} = options;
	console.log({ inputFile });
	const repos = await getData(inputFile);
	const outputFileName =
		(outputFile && outputFile.endsWith('.csv') && outputFile) ||
		`${org}-gitlab-repos-direct-collaborators-${currentTime()}.csv`;
	const stringifier = getStringifier(outputFileName, columns);

	for (const repo of repos) {
		let { data: repoUsersInfo } = await getReposDirectCollaborators(options, {
			repoId: repo.id,
		});
		console.log(JSON.stringify(repoUsersInfo, null, 2));
		let reposLength = repoUsersInfo.length;
		processReposDirectCollaborators(repo.repo, repoUsersInfo, stringifier);
		await delay(waitTime);

		while (reposLength == batchSize) {
			const { data } = await getReposDirectCollaborators(options, {
				repoId: repo.id,
				idAfter: repoUsersInfo[Number(batchSize) - 1].id,
			});
			repoUsersInfo = data;
			processReposDirectCollaborators(repo.repo, repoUsersInfo, stringifier);
			reposLength = repoUsersInfo.length;
			await delay(waitTime);
		}
	}

	stringifier.end();
};

export default getGitlabReposDirectCollaborators;
