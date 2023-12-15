#!/usr/bin/env node

import Ora from 'ora';
import {
	getData,
	getStringifier,
	currentTime,
} from '../../../../services/utils.js';
import { getOrgUsers } from './get-org-users.js';

const spinner = Ora();

export const getEnterpriseUsers = async (options) => {
	const { outputFile, usersFile, enterpriseOrganizations } = options;
	let enterpriseUsers = [];

	if (usersFile) {
		const usersData = await getData(usersFile);
		enterpriseUsers = usersData.map((row) => row.login.toLowerCase());
	}

	spinner.start('Fetching enterprise users...');
	const outputFileName =
		(outputFile && outputFile.endsWith('.csv') && outputFile) ||
		`enterprise-users-${currentTime()}.csv`;
	const stringifier = getStringifier(outputFileName, ['login']);
	const usersSet = new Set();

	for (let org of enterpriseOrganizations) {
		options.organization = org;
		options.return = true;
		const orgUsersData = await getOrgUsers(options);
		const orgUsers = orgUsersData.map((user) => user.login.toLowerCase());

		for (const user of orgUsers) {
			usersSet.add(user);
		}
	}

	for (const user of usersSet.keys()) {
		if (enterpriseUsers.length > 0 && !enterpriseUsers.includes(user)) continue;

		stringifier.write({ login: user });
	}

	stringifier.end();
	spinner.succeed('Successfully fetched enterprise users...');
};
