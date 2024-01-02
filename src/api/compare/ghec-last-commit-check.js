#!/usr/bin/env node

import {
	getStringifier,
	getData,
	delay,
	doRequest,
	currentTime,
} from '../../services/utils.js';
import { GITHUB_API_URL } from '../../services/constants.js';

const getReposConfig = (options) => {
	const { serverUrl, sourceOrg, sourceToken, batchSize, page } = options;
	const url = `${serverUrl}/api/v3/orgs/${sourceOrg}/repos?per_page=${batchSize}&page=${page}`;

	return {
		method: 'get',
		maxBodyLength: Infinity,
		url,
		headers: {
			Accept: 'application/vnd.github+json',
			Authorization: `Bearer ${sourceToken}`,
		},
	};
};

const getPaginatedSourceRepos = async (options) => {
	const { batchSize, waitTime } = options;
	const repos = [];
	let page = 1;
	let hasNextPage = true;

	while (hasNextPage) {
		const config = getReposConfig(options, page);
		const { data } = await doRequest(config);
		repos.push(...data);
		page++;
		hasNextPage = data.length == batchSize;
		await delay(waitTime);
	}

	return repos.map((repo) => repo.name);
};

const getSourceRepos = async (options) => {
	const { inputFile } = options;

	if (inputFile) {
		const reposData = await getData(inputFile);
		const repos = reposData.map((repo) => repo.repo);
		return repos;
	}

	return getPaginatedSourceRepos(options);
};

const getRepoBranchesConfig = (repo, options, page, serverUrl) => {
	const { sourceOrg, sourceToken, ghecOrg, token, batchSize } = options;
	let url = `${GITHUB_API_URL}/repos/${ghecOrg}/${repo}/branches?per_page=${batchSize}&page=${page}`;
	let bearerToken = token;

	if (serverUrl) {
		url = `${serverUrl}/api/v3/repos/${sourceOrg}/${repo}/branches?per_page=${batchSize}&page=${page}`;
		bearerToken = sourceToken;
	}

	return {
		method: 'get',
		maxBodyLength: Infinity,
		url,
		headers: {
			Accept: 'application/vnd.github+json',
			Authorization: `Bearer ${bearerToken}`,
		},
	};
};

const getPaginatedRepoBranches = async (repo, options, serverUrl) => {
	const { batchSize, waitTime } = options;
	const branches = [];
	let page = 1;
	let hasNextPage = true;

	while (hasNextPage) {
		const config = getRepoBranchesConfig(repo, options, page, serverUrl);
		const { data } = await doRequest(config);
		branches.push(...data);
		page++;
		hasNextPage = data.length == batchSize;
		await delay(waitTime);
	}

	return branches;
};

const compareBranches = (sourceBranches, targetBranches) => {
	for (const sourceBranch of sourceBranches) {
		const {
			name,
			commit: { sha },
		} = sourceBranch;
		const foundBranch = targetBranches.find((branch) => branch.name === name);

		if (!foundBranch) return false;

		return foundBranch.commit.sha !== sha;
	}
};

const ghecLastCommitCheck = async (options) => {
	const { serverUrl, sourceOrg, ghecOrg, outputFile } = options;
	const outputFileName =
		(outputFile && outputFile.endsWith('.csv') && outputFile) ||
		`${sourceOrg}-${ghecOrg}-last-commit-check-${currentTime()}.csv`;
	const stringifier = getStringifier(outputFileName, ['repo']);
	const sourceRepos = await getSourceRepos(options);

	for (const sourceRepo of sourceRepos) {
		const sourceRepoBranches = await getPaginatedRepoBranches(
			sourceRepo,
			options,
			serverUrl,
		);
		const ghecRepoBranches = await getPaginatedRepoBranches(
			sourceRepo,
			options,
		);
		const hasMismatch = compareBranches(sourceRepoBranches, ghecRepoBranches);

		if (hasMismatch) {
			stringifier.write({ repo: sourceRepo });
		}
	}

	stringifier.end();
};

export default ghecLastCommitCheck;
