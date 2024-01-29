#!/usr/bin/env node

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
import { GITHUB_API_URL } from '../../../../services/constants.js';

const tableHead = ['Organization', 'No. of outside collaborators'].map((h) =>
	speak.successColor(h),
);

const getOutsideCollaboratorsConfig = (page, options) => {
	const { organization: org, serverUrl, token } = options;
	let url = `${GITHUB_API_URL}/orgs/${org}/outside_collaborators?per_page=100&page=${page}`;

	if (serverUrl) {
		url = `${serverUrl}/api/v3/orgs/${org}/outside_collaborators?per_page=100&page=${page}`;
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

const fetchOutsideCollaborators = async (page, options) => {
	const config = getOutsideCollaboratorsConfig(page, options);
	return doRequest(config);
};

const exportGithubOutsideCollaborators = async (options) => {
	try {
		speak.success('Started exporting outside collaborators');
		const table = new Table({
			head: tableHead,
			chars: tableChars,
		});
		const { usersFile, organization: org, outputFile, waitTime } = options;
		let page = 1;
		let length = 0;
		const outsideCollaborators = [];
		const outputFileName =
			(outputFile && outputFile.endsWith('.csv') && outputFile) ||
			`${org}-outside-collaborators-${currentTime()}.csv`;
		const stringifier = getStringifier(outputFileName, ['login']);
		let enterpriseUsers = [];

		if (usersFile) {
			const usersData = await getData(usersFile);
			enterpriseUsers = usersData.map((row) => row.login.toLowerCase());
		}

		while (page === 1 || length === 100) {
			const response = await fetchOutsideCollaborators(page, options);

			if (response.data) {
				const responseData = response.data;
				length = responseData.length;

				for (const user of responseData) {
					let { login } = user;
					login = login.toLowerCase();
					speak.info(`login: ${login}`);

					if (enterpriseUsers.length > 0) {
						if (enterpriseUsers.includes(login)) {
							stringifier.write({ login });
							outsideCollaborators.push(login);
						}
					} else {
						stringifier.write({ login });
						outsideCollaborators.push(login);
					}
				}
			}

			page++;
			await delay(waitTime);
		}

		stringifier.end();

		const outsideCollaboratorsLength = outsideCollaborators.length;
		if (outsideCollaboratorsLength === 0) {
			speak.warn('No outside collaborators found');
		} else {
			speak.success(
				`Found ${outsideCollaboratorsLength} outside collaborators`,
			);
			speak.success(`Written results to output file: ${outputFileName}`);
		speak.success(
			`Successfully exported outside collaborators for ${org}`,
		);
		}

		table.push([org, outsideCollaboratorsLength]);
		console.log(table.toString());

		return outsideCollaborators;
	} catch (error) {
		speak.error(error);
		speak.error('Failed to export outside collaborators');
	}
};

export default exportGithubOutsideCollaborators;
