#!/usr/bin/env node

import progress from 'cli-progress';
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

const getOutputFileName = (outputFile, org) => {
	if (outputFile && outputFile.endsWith('.csv')) return outputFile;
	return `${org}-gitlab-repo-direct-collaborators-${currentTime()}.csv`;
};

const exportGitlabRepoDirectCollaborators = async (options) => {
	const {
		organization: org,
		inputFile,
		outputFile,
		waitTime,
		batchSize,
		skip,
	} = options;

	const repos = (await getData(inputFile)).slice(Number(skip));
	const progressBar = new progress.SingleBar(
		{},
		progress.Presets.shades_classic,
	);
	progressBar.start(repos.length, 0);

	const outputFileName = getOutputFileName(outputFile, org);
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

		progressBar.increment();
	}

	progressBar.stop();
	stringifier.end();
};

export default exportGitlabRepoDirectCollaborators;
