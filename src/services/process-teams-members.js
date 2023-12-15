#!/usr/bin/env node

import { getData, getStringifier } from './utils.js';

const processMembers = (members, enterpriseUsers, slug, stringifier) => {
	if (members) {
		const membersArray = members.split(';');

		for (const memberInfo of membersArray) {
			let [member, _, role] = memberInfo.split(':');
			member = member.toLowerCase();

			if (enterpriseUsers.length > 0 && !enterpriseUsers.includes(member))
				continue;

			stringifier.write({ member, team: slug, role });
		}
	}
};

const getEnterpriseUsers = async (usersFile) => {
	if (!usersFile) return [];

	const usersData = await getData(usersFile);
	return usersData.map((row) => row.login.toLowerCase());
};

const processTeamsMembers = async (teams, path, options) => {
	const { usersFile } = options;
	const columns = ['member', 'team', 'role'];
	const stringifier = getStringifier(path, columns);
	const enterpriseUsers = await getEnterpriseUsers(usersFile);

	for (const team of teams) {
		const { slug, members } = team;
		processMembers(members, enterpriseUsers, slug, stringifier);
	}

	stringifier.end();
};

export default processTeamsMembers;
