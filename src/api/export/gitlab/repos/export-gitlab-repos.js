#!/usr/bin/env node

import {
	doRequest,
	getStringifier,
	currentTime,
	delay,
} from '../../../../services/utils.js';

const processRepositories = (
	values,
	metrics,
	stringifier,
	archivedStringifier,
	activeStringifier,
) => {
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
		metrics.push(row);

		if (row.isArchived) {
			archivedStringifier.write(row);
		} else {
			activeStringifier.write(row);
		}
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

const getOutputFileNames = (outputFile, org) => {
	const outputFileName =
		(outputFile && outputFile.endsWith('.csv') && outputFile) ||
		`${org}-gitlab-repos-${currentTime()}.csv`;
	const archivedOutputFileName =
		outputFileName.split('.csv')[0] + '-archived.csv';
	const activeOutputFileName = outputFileName.split('.csv')[0] + '-active.csv';
	const teamPermissionFileName = `${org}-gitlab-repos-team-permissions-${currentTime()}.csv`;

	return {
		outputFileName,
		archivedOutputFileName,
		activeOutputFileName,
		teamPermissionFileName,
	};
};

const getStringifiers = (fileNames) => {
	const {
		outputFileName,
		archivedOutputFileName,
		activeOutputFileName,
		teamPermissionFileName,
	} = fileNames;
	const stringifier = getStringifier(outputFileName, columns);
	const archivedStringifier = getStringifier(archivedOutputFileName, columns);
	const activeStringifier = getStringifier(activeOutputFileName, columns);
	const permissionStringifier = getStringifier(
		teamPermissionFileName,
		permissionColumns,
	);

	return {
		stringifier,
		archivedStringifier,
		activeStringifier,
		permissionStringifier,
	};
};

const processPagination = async ({
	options,
	reposInfo,
	reposLength,
	metrics,
	batchSize,
	stringifiers,
}) => {
	const {
		stringifier,
		archivedStringifier,
		activeStringifier,
		permissionStringifier,
	} = stringifiers;
	while (reposLength == batchSize) {
		const { data } = await getRepositories(options, {
			idAfter: reposInfo[Number(batchSize) - 1].id,
		});
		reposInfo = data;
		processRepositories(
			reposInfo,
			metrics,
			stringifier,
			archivedStringifier,
			activeStringifier,
			permissionStringifier,
		);
		processRepoTeamPermission(reposInfo, permissionStringifier);
		reposLength = reposInfo.length;
		await delay(waitTime);
	}
};

const exportGitlabRepositories = async (options) => {
	const { organization: org, outputFile, waitTime, batchSize } = options;
	const metrics = [];
	const {
		outputFileName,
		archivedOutputFileName,
		activeOutputFileName,
		teamPermissionFileName,
	} = getOutputFileNames(outputFile, org);
	const {
		stringifier,
		archivedStringifier,
		activeStringifier,
		permissionStringifier,
	} = getStringifiers({
		outputFileName,
		archivedOutputFileName,
		activeOutputFileName,
		teamPermissionFileName,
	});
	let { data: reposInfo } = await getRepositories(options, { idAfter: null });
	let reposLength = reposInfo.length;
	processRepositories(
		reposInfo,
		metrics,
		stringifier,
		archivedStringifier,
		activeStringifier,
		permissionStringifier,
	);
	processRepoTeamPermission(reposInfo, permissionStringifier);
	await delay(waitTime);

	await processPagination({
		options,
		reposInfo,
		reposLength,
		metrics,
		batchSize,
		waitTime,
		stringifiers: {
			stringifier,
			archivedStringifier,
			activeStringifier,
			permissionStringifier,
		},
	});

	stringifier.end();
	archivedStringifier.end();
	activeStringifier.end();
	permissionStringifier.end();

	return metrics;
};

export default exportGitlabRepositories;
