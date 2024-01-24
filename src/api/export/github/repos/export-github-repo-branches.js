#!/usr/bin/env node

import progress from 'cli-progress';
import Table from 'cli-table';
import * as speak from '../../../../services/style-utils.js';
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
			.map((repo) => repo.name)
			.skip(Number(skip));
		const progressBar = new progress.SingleBar(
			{},
			progress.Presets.shades_classic,
		);
		progressBar.start(repos.length, 0);
		let index = 0;

		for (const repo of repos) {
			const response = await fetchRepoBranches(repo, options);
			const responseData = response.data;
			let status = response.status;
			let statusText = response.statusText;
			let errorMessage = response.errorMessage;
			console.log(index++);

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

				table.push([index, repo, branches.length]);
				branches.forEach((branch) => stringifier.write(branch));
				speak.success(
					`Successfully exported branches for repo ${repo} (${index}/${repos.length})`,
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
			progressBar.increment();
		}

		console.log(table.toString());
		stringifier.end();
		progressBar.stop();

		speak.success(`Written results to output file: ${outputFileName}`);
		speak.success(`Successfully processed repos branches for ${org}`);
	} catch (error) {
		speak.error(error);
		speak.error('Failed to get repos branches');
	}
};

export default exportGithubRepoBranches;
