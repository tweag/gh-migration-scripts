#!/usr/bin/env node

import Table from 'cli-table';
import * as speak from '../../../../services/style-utils.js';
import { tableChars } from '../../../../services/style-utils.js';
import {
	doRequest,
	getStringifier,
	delay,
	currentTime,
} from '../../../../services/utils.js';
import {
	GITHUB_API_URL,
	SUCCESS_STATUS,
} from '../../../../services/constants.js';

const getRunnersConfig = (page, options) => {
	const { organization: org, serverUrl, token } = options;
	let url = `${GITHUB_API_URL}/orgs/${org}/actions/runners?per_page=100&page=${page}`;

	if (serverUrl) {
		url = `${serverUrl}/api/v3/orgs/${org}/actions/runners?per_page=100&page=${page}`;
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

const fetchRunners = async (page, options) => {
	const config = getRunnersConfig(page, options);
	return doRequest(config);
};

const getOutputFileName = (org, outputFile) => {
	if (outputFile && outputFile.endsWith('.csv')) return outputFile;
	return `${org}-github-actions-self-hosted-runners-${currentTime()}.csv`;
};

const columns = ['id', 'name', 'os', 'status', 'busy', 'labels'];

const tableHead = ['No.', 'Runner Name'].map((h) => speak.successColor(h));

const exportGithubActionsSelfHostedRunners = async (options) => {
	try {
		const { organization: org, outputFile, waitTime } = options;

		speak.success(
			`Started exporting github actions self-hosted runners for ${org}`,
		);

		const statusColumns = ['page', 'status', 'statusText', 'errorMessage'];
		const outputFileName = getOutputFileName(org, outputFile);
		const stringifier = getStringifier(outputFileName, columns);
		const statusStringifier = getStringifier(`status-${outputFileName}`, statusColumns);
		const table = new Table({
			head: tableHead,
			chars: tableChars,
		});

		let index = 0;
		let page = 1;
		let length = 0;

		while (page === 1 || length === 100) {
			const response = await fetchRunners(page, options);
			const responseData = response.data;
			let status = response.status;
			let statusText = response.statusText;
			let errorMessage = response.errorMessage;

			if (responseData) {
				(status = SUCCESS_STATUS), (statusText = '');
				errorMessage = '';
				length = responseData.length;

				for (const runner of responseData) {
					const { id, name, os, status, busy, labels } = runner;
					const runnerLabels = labels
						.map((label) => label.name + ':' + label.type)
						.join(';');
					const row = { id, name, os, status, busy, labels: runnerLabels };
					table.push([++index, name]);
					stringifier.write(row);
				}
			} else {
				length = 0;
			}

			statusStringifier.write({ page, status, statusText, errorMessage });
			await delay(waitTime);
			page++;
		}

		stringifier.end();
		statusStringifier.end();
		console.log('\n' + table.toString());
		speak.success(
			`Successfully saved github actions self-hosted runner to ${outputFileName}`,
		);
		console.log('\n' + table.toString());
	} catch (error) {
		speak.error(error);
		speak.error('Failed to export github actions self-hosted runner');
	}
};

export default exportGithubActionsSelfHostedRunners;
