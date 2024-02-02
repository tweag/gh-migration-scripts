#!/usr/bin/env node

import progressBar from 'progress-bar-cli';
import Table from 'cli-table';
import * as speak from '../../../../services/style-utils.js';
import { tableChars } from '../../../../services/style-utils.js';
import {
	delay,
	doRequest,
	getData,
	getStringifier,
	currentTime,
} from '../../../../services/utils.js';
import {
	GITHUB_API_URL,
	SUCCESS_STATUS,
	PROGRESS_BAR_CLEAR_NUM,
} from '../../../../services/constants.js';

const columns = ['repo', 'branch', 'commit', 'protected'];
const statusColumns = ['num', 'repo', 'status', 'statusText', 'errorMessage'];
const tableHead = ['No.', 'Repo', 'No. of Branches'].map((h) =>
	speak.successColor(h),
);

const getRepoBranchesConfig = (repo, options) => {
	const { organization: org, serverUrl, token } = options;
	let url = `${GITHUB_API_URL}/repos/${org}/${repo}/branches?per_page=100`;

	if (serverUrl) {
		url = `${serverUrl}/api/v3/repos/${org}/${repo}/branches?per_page=100`;
	}

	return {
		method: 'get',
		maxBodyLength: Infinity,
		url,
		headers: {
			Accept: 'application/vnd.github+json',
			Authorization: `Bearer ${token}`,
		},
	};
};

const fetchRepoBranches = async (repo, options) => {
	const config = getRepoBranchesConfig(repo, options);
	return doRequest(config);
};

const getOutputFileName = (org, outputFile) => {
	if (outputFile && outputFile.endsWith('.csv')) return outputFile;
	return `${org}-github-repo-branches-${currentTime()}.csv`;
};

const exportGithubRepoBranches = async (options) => {
	try {
		speak.success('Getting repos branches');
		const table = new Table({
			head: tableHead,
			chars: tableChars,
		});
		const {
			inputFile,
			organization: org,
			outputFile,
			skip,
			waitTime,
		} = options;
		const outputFileName = getOutputFileName(org, outputFile);
		const stringifier = getStringifier(outputFileName, columns);
		const statusStringifier = getStringifier(
			`status-${outputFileName}`,
			statusColumns,
		);
		const repos = (await getData(inputFile))
			.map((repo) => repo.repo)
			.slice(Number(skip));
		let index = 0;

		for (const repo of repos) {
			progressBar.progressBar(index, repos.length, new Date(), PROGRESS_BAR_CLEAR_NUM);
			const response = await fetchRepoBranches(repo, options);
			const responseData = response.data;
			let status = response.status;
			let statusText = response.statusText;
			let errorMessage = response.errorMessage;
			index++;

			if (responseData) {
				status = SUCCESS_STATUS;
				statusText = '';
				errorMessage = '';
				const branches = responseData.map((branch) => ({
					repo,
					branch: branch.name,
					commit: branch.commit.sha,
					protected: branch.protected,
				}));
				const branchesLength = branches.length;

				table.push([index, repo, branchesLength]);
				branches.forEach((branch) => stringifier.write(branch));
				speak.success(
					`\nSuccessfully exported ${branchesLength} branches for repo: ` + speak.infoColor(`${repo}`),
				);
			}

			statusStringifier.write({
				num: index,
				repo,
				status,
				statusText,
				errorMessage,
			});
			await delay(waitTime);
		}

		console.log('\n' + table.toString());
		stringifier.end();

		speak.success(`Written results to output file: ${outputFileName}`);
		speak.success(`Successfully processed repos branches for ${org}`);
	} catch (error) {
		speak.error(error);
		speak.error('Failed to get repos branches');
	}
};

export default exportGithubRepoBranches;
