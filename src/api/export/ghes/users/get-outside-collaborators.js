#!/usr/bin/env node

import Ora from 'ora';
import * as speak from '../../../../services/speak.js';
import {
	delay,
	doRequest,
	getData,
	getStringifier,
	currentTime,
} from '../../../../services/utils.js';
import { GITHUB_API_URL } from '../../../../services/constants.js';

const spinner = Ora();

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

export const getOutsideCollaborators = async (options) => {
	try {
		spinner.start(speak.successColor('Getting outside collaborators'));
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
					speak.info(`login: ${login}`)

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

		if (outsideCollaborators.length === 0) {
			speak.warn(`No outside collaborators found`);
		} else {
			speak.success(
				`Found ${outsideCollaborators.length} outside collaborators`,
			);
		}

		speak.success(`Written results to output file: ${outputFileName}`);
		spinner.succeed(speak.successColor(`Successfully process outside collaborators for ${org}`));
		return outsideCollaborators;
	} catch (error) {
		speak.error(error);
		spinner.fail(speak.errorColor('Failed to get outside collaborators'));
	}
};
