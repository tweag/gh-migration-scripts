#!/usr/bin/env node

import { getRepos } from '../../export/ghes/repos/get-repos.js';
import {
	getData,
	getStringifier,
	currentTime,
} from '../../../services/utils.js';

const columns = [
	'repo',
	'pushedAt',
	'ghesPushedAt',
	'updatedAt',
	'ghesUpdatedAt',
	'hasChanged',
	'hasPushed',
	'hasUpdated',
	'hasPRChanged',
	'hasIssuesChanged',
	'isNewRepo',
];

const compareRepos = (ghecRepo, ghesRepo, ghesFile) => {
	let { pushedAt: ghecPushedAt, updatedAt: ghecUpdatedAt } = ghecRepo;
	let { pushedAt, updatedAt, pullRequests, issues } = ghesRepo;

	if (ghesFile) {
		pullRequests = pullRequests.split(':');
		issues = issues.split(':');
	}

	ghecPushedAt = new Date(ghecPushedAt).getTime();
	ghecUpdatedAt = new Date(ghecUpdatedAt).getTime();

	pushedAt = new Date(pushedAt).getTime();
	updatedAt = new Date(updatedAt).getTime();

	if (ghecPushedAt < pushedAt) {
		ghesRepo.hasPushed = true;
		ghesRepo.hasChanged = true;
	}

	if (ghecUpdatedAt < updatedAt) {
		ghesRepo.hasUpdated = true;
		ghesRepo.hasChanged = true;
	}

	for (let pullRequest of pullRequests) {
		if (pullRequest > ghecPushedAt || pullRequest > ghecUpdatedAt) {
			ghesRepo.hasPRChanged = true;
			ghesRepo.hasChanged = true;
		}
	}

	for (let issue of issues) {
		if (issue > ghecPushedAt || issue > ghecUpdatedAt) {
			ghesRepo.hasIssuesChanged = true;
			ghesRepo.hasChanged = true;
		}
	}

	repo.ghesPushedAt = ghecPushedAt;
	repo.ghesUpdatedAt = ghecUpdatedAt;
};

export const ghesVsGhec = async (options) => {
	try {
		const {
			ghecFile,
			ghesFile,
			ghecOrg,
			ghesOrg,
			ghecToken,
			ghesToken,
			serverUrl,
			outputFile,
		} = options;

		const outputFileName =
			(outputFile && outputFile.endsWith('.csv') && outputFile) ||
			`${ghecOrg}-${ghesOrg}-updated-details-${currentTime()}.csv`;
		const stringifier = getStringifier(outputFileName, columns);
		let ghecRepos = [];
		let ghesRepos = [];
		options.return = true;

		if (ghecFile) {
			ghecRepos = await getData(ghecFile);
		} else {
			options.token = ghecToken;
			options.organization = ghecOrg;
			options.serverUrl = undefined;
			ghecRepos = await getRepos(options);
		}

		if (ghesFile) {
			ghesRepos = await getData(ghesFile);
		} else {
			options.token = ghesToken;
			options.organization = ghesOrg;
			options.serverUrl = serverUrl;
			ghesRepos = await getRepos(options);
		}

		for (let ghesRepo of ghesRepos) {
			const found = ghecRepos.find((r) => r.repo === ghesRepo.repo);

			if (found) {
				compareRepos(found, ghesRepo, ghesFile);
			} else {
				ghesRepo.isNewRepo = true;
			}

			stringifier.write(ghesRepo);
		}

		stringifier.end();
	} catch (error) {
		console.log(error);
	}
};
