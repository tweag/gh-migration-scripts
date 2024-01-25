#!/usr/bin/env node

import progress from 'cli-progress';
import Table from 'cli-table';
import {
	doRequest,
	getData,
	getStringifier,
	currentTime,
	delay,
} from '../../../../services/utils.js';
import * as speak from '../../../../services/style-utils.js';
import { tableChars } from '../../../../services/style-utils.js';

const processRepoBranches = (repo, branches, stringifier) => {
	for (const branch of branches) {
		const {
			name,
			protected: branchProtection,
			commit: { id },
		} = branch;
		const row = {
			repo,
			branch: name,
			commit: id,
			protected: branchProtection,
		};
		stringifier.write(row);
	}
};

const getRepoBranchesConfig = (options, urlOpts) => {
	const { token, batchSize, serverUrl } = options;
	const { repoId, idAfter } = urlOpts;
	let url = `${serverUrl}/api/v4/projects/${repoId}/repository/branches?pagination=keyset&per_page=${batchSize}&order_by=id&sort=asc`;

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

const getRepoBranches = async (options, urlOpts) => {
	const config = getRepoBranchesConfig(options, urlOpts);
	return doRequest(config);
};

const columns = ['repo', 'branch', 'commit', 'protected'];
const statusColumns = ['num', 'repo', 'status', 'statusText', 'errorMessage'];
const tableHead = ['No.', 'Repo', 'No. of Branches'].map((h) =>
	speak.successColor(h),
);

const getOutputFileName = (outputFile, org) => {
	if (outputFile && outputFile.endsWith('.csv')) return outputFile;
	return `${org}-gitlab-repo-branches-${currentTime()}.csv`;
};

const exportGitlabRepoBranches = async (options) => {
	const { organization: org, inputFile, outputFile, waitTime, skip } = options;

	const repos = (await getData(inputFile)).slice(Number(skip));
	const table = new Table({
		chars: tableChars,
		head: tableHead,
	});
	const progressBar = new progress.SingleBar(
		{},
		progress.Presets.shades_classic,
	);
	progressBar.start(repos.length, 0);

	const outputFileName = getOutputFileName(outputFile, org);
	const stringifier = getStringifier(outputFileName, columns);
	const statusStringifier = getStringifier(
		`status-${outputFileName}`,
		statusColumns,
	);
	let index = 0;

	for (const repo of repos) {
		console.log(++index);
		const response = await getRepoBranches(options, {
			repoId: repo.id,
		});

		const responseData = response.data;
		let status = response.status;
		let statusText = response.statusText;
		let errorMessage = response.errorMessage;

		if (responseData) {
			status = SUCCESS_STATUS;
			statusText = '';
			errorMessage = '';
			console.log(JSON.stringify(responseData, null, 2));
			const branchesLength = responseData.length;
			processRepoBranches(repo.repo, responseData, stringifier);
			await delay(waitTime);

			table.push([index, repo.repo, branchesLength]);
		}

		statusStringifier.write({
			num: index,
			repo: repo.repo,
			status,
			statusText,
			errorMessage,
		});
		progressBar.increment();
	}

	console.log(table.toString());
	progressBar.stop();
	stringifier.end();
};

export default exportGitlabRepoBranches;
