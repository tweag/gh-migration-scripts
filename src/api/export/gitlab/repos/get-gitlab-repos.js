#!/usr/bin/env node

import {
	doRequest,
	getStringifier,
	currentTime,
	delay,
} from '../../../../services/utils.js';

const processRepositories = (values, stringifier) => {
	for (const value of values) {
		const {
			name,
			id,
			archived,
			visibility,
			namespace,
			path_with_namespace: pathWithNamespace,
		} = value;

		const row = {
			group: namespace.full_path,
			name,
			repo: pathWithNamespace.split('/').slice(-1)[0],
			id,
			visibility,
			isArchived: archived ? true : false,
		};

		stringifier.write(row);
	}
};

const permissionsMap = {
	50: 'admin',
	40: 'admin',
	30: 'write',
	20: 'read',
	10: 'triage',
};

const processPermission = (groupAccess) => {
	if (!groupAccess || !groupAccess.access_level) return 'triage';

	return permissionsMap[groupAccess.access_level];
};

const processRepoTeamPermission = (values, stringifier) => {
	for (const value of values) {
		const { path, namespace, permissions } = value;
		stringifier.write({
			repo: path,
			team: namespace.full_path,
			permission: processPermission(permissions.group_access),
		});
	}
};

const getRepositoriesConfig = (options, urlOpts) => {
	const { token, batchSize, serverUrl } = options;
	const { idAfter } = urlOpts;
	let url = `${serverUrl}/api/v4/projects?pagination=keyset&per_page=${batchSize}&order_by=id&sort=asc`;

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

const getRepositories = async (options, urlOpts) => {
	const config = getRepositoriesConfig(options, urlOpts);
	return doRequest(config);
};

const columns = ['name', 'repo', 'group', 'id', 'isArchived', 'visibility'];
const permissionColumns = ['repo', 'team', 'permission'];

const getGitlabRepositories = async (options) => {
	const { organization: org, outputFile, waitTime, batchSize } = options;
	const outputFileName =
		(outputFile && outputFile.endsWith('.csv') && outputFile) ||
		`${org}-gitlab-repos-${currentTime()}.csv`;
	const teamPermissionFileName = `${org}-gitlab-repos-team-permissions-${currentTime()}.csv`;
	const stringifier = getStringifier(outputFileName, columns);
	const permissionStringifier = getStringifier(
		teamPermissionFileName,
		permissionColumns,
	);
	let { data: reposInfo } = await getRepositories(options, { idAfter: null });
	let reposLength = reposInfo.length;
	processRepositories(reposInfo, stringifier);
	processRepoTeamPermission(reposInfo, permissionStringifier);
	await delay(waitTime);

	while (reposLength == batchSize) {
		const { data } = await getRepositories(options, {
			idAfter: reposInfo[Number(batchSize) - 1].id,
		});
		reposInfo = data;
		processRepositories(reposInfo, stringifier);
		processRepoTeamPermission(reposInfo, permissionStringifier);
		reposLength = reposInfo.length;
		await delay(waitTime);
	}

	stringifier.end();
	permissionStringifier.end();
};

export default getGitlabRepositories;
