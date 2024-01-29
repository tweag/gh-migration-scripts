#!/usr/bin/env node

import progressBar from 'progress-bar-cli';
import Table from 'cli-table';
import * as speak from '../../../../services/style-utils.js';
import { tableChars } from '../../../../services/style-utils.js';
import {
	doRequest,
	getStringifier,
	currentTime,
	delay,
} from '../../../../services/utils.js';
import { SUCCESS_STATUS, PROGRESS_BAR_CLEAR_NUM } from '../../../../services/constants.js';

const processRepoBranches = (repo, branches, stringifier) => {
	for (const branch of branches) {
		const { latestCommit, id } = branch;
		const idSplit = id.split('/');
		const name = idSplit[idSplit.length - 1];
		const row = {
			repo,
			branch: name,
			commit: latestCommit,
			protected: false,
		};
		stringifier.write(row);
	}
};

const getRepoBranchesConfig = (options, repo) => {
	const { organization: project, token, batchSize, serverUrl } = options;
	let url = `${serverUrl}/rest/api/latest/projects/${project}/repos/${repo}/branches?limit=${batchSize}`;

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

const getRepoBranches = async (options, repo) => {
	const config = getRepoBranchesConfig(options, repo);
	return doRequest(config);
};

const columns = ['repo', 'branch', 'commit', 'protected'];
const statusColumns = ['num', 'repo', 'status', 'statusText', 'errorMessage'];
const tableHead = ['No.', 'Repo', 'No. of Branches'].map((h) =>
	speak.successColor(h),
);

const getOutputFileName = (outputFile, org) => {
	if (outputFile && outputFile.endsWith('.csv')) return outputFile;

	return `${org}-bitbucket-repo-branches-${currentTime()}.csv`;
};

const exportBitbucketRepoBranches = async (options) => {
	try {
		const {
			organization: org,
			inputFile,
			outputFile,
			waitTime,
			skip,
		} = options;
		const repos = (await getData(inputFile))
			.map((row) => row.repo)
			.slice(Number(skip));
		const outputFileName = getOutputFileName(outputFile, org);
		const stringifier = getStringifier(outputFileName, columns);
		const statusStringifier = getStringifier(
			`status-${outputFileName}`,
			statusColumns,
		);
		speak.success('Getting repos branches');
		const table = new Table({
			head: tableHead,
			chars: tableChars,
		});
		let index = 0;

		for (const repo of repos) {
			progressBar.progressBar(index, repos.length, new Date(), PROGRESS_BAR_CLEAR_NUM);
			++index;
			const response = await getRepoBranches(options, repo);

			const responseData = response.data;
			let status = response.status;
			let statusText = response.statusText;
			let errorMessage = response.errorMessage;

			if (responseData) {
				status = SUCCESS_STATUS;
				statusText = '';
				errorMessage = '';
				processRepoBranches(repo, responseData.values, stringifier);
			}

			statusStringifier.write({
				num: index,
				repo,
				status,
				statusText,
				errorMessage,
			});
			progressBar.increment();
			table.push([index, repo]);
			await delay(waitTime);
		}

		progressBar.stop();
		stringifier.end();
		speak.success('Successfully exported Bitbucket repositories branches');
	} catch (error) {
		speak.error(error);
		speak.error('Failed to export Bitbucket repositories branches');
	}
};

export default exportBitbucketRepoBranches;
