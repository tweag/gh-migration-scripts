#!/usr/bin/env node

import Ora from 'ora';
import {
	getData,
	getStringifier,
	currentTime,
} from '../../../../services/utils.js';
import getBitbucketOrganizationMembers from './get-bitbucket-organization-users.js';

const spinner = Ora();

const getBitbucketEnterpriseUsers = async (options) => {
	const { outputFile, usersFile, enterpriseOrganizations } = options;
	let enterpriseUsers = [];

	if (usersFile) {
		const usersData = await getData(usersFile);
		enterpriseUsers = usersData.map((row) => row.login.toLowerCase());
	}

	spinner.start('Fetching Bitbucket enterprise users...');
	const outputFileName =
		(outputFile && outputFile.endsWith('.csv') && outputFile) ||
		`bitbucket-cloud-enterprise-users-${currentTime()}.csv`;
	const stringifier = getStringifier(outputFileName, ['login']);
	const usersSet = new Set();

	for (let org of enterpriseOrganizations) {
		options.organization = org;
		const orgUsersData = await getBitbucketOrganizationMembers(options);
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
	spinner.succeed('Successfully fetched Bitbucket cloud enterprise users...');
};

export default getBitbucketEnterpriseUsers;
