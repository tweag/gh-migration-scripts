#!/usr/bin/env node

import progress from 'cli-progress';
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

const exportBitbucketRepoTeamPermissions = async (options) => {
	const {
		organization: project,
		inputFile,
		outputFile,
		waitTime,
		skip,
	} = options;
	const repos = (await getData(inputFile))
		.map((row) => row.repo)
		.slice(Number(skip));
	const outputFileName =
		(outputFile && outputFile.endsWith('.csv') && outputFile) ||
		`${project}-bitbucket-repo-teams-permissions-${currentTime()}.csv`;
	const stringifier = getStringifier(outputFileName, columns);
	const progressBar = new progress.SingleBar(
		{},
		progress.Presets.shades_classic,
	);
	progressBar.start(repos.length, 0);

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

		progressBar.increment();
	}

	progressBar.stop();
	stringifier.end();
};

export default exportBitbucketRepoTeamPermissions;
