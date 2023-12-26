#!/usr/bin/env node

import { deleteRepos } from '../../import/ghec/repos/delete-repos.js';
import {
	getData,
	getStringifier,
	currentTime,
} from '../../../services/utils.js';

const columns = [
	'repo',
	'pushedAt',
	'ghecUpdatedAt',
	'hasChanged',
	'isNewRepo',
];

const compareRepo = (ghecRepo, ghesRepo, ghesFile) => {
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

const compareRepos = (ghecRepos, ghesRepos) => {
	const ghecUpdatedAt = new Date(ghecRepos.updatedAt).getTime();
	const ghesUpdatedAt = new Date(ghesRepos.updatedAt).getTime();

	return ghecUpdatedAt < ghesUpdatedAt;
}

const ghesLastCommitCheck = async (options) => {
	const {
		ghecFile,
		ghesFile,
		ghecOrg,
		ghesOrg,
		token,
		outputFile,
		delete: canDelete,
	} = options;

	const outputFileName =
		(outputFile && outputFile.endsWith('.csv') && outputFile) ||
		`${ghecOrg}-${ghesOrg}-updated-details-${currentTime()}.csv`;
	const stringifier = getStringifier(outputFileName, columns);
	let ghecRepos = await getData(ghecFile);
	let ghesRepos = await getData(ghesFile);

	for (let ghesRepo of ghesRepos) {
		const obj = {
			repo: ghesRepo.repo,
			updatedAt: ghesRepo.updatedAt,
			ghecUpdatedAt: '',
			hasChanged: false,
			isNewRepo: true,
		};
		const foundRepo = ghecRepos.find((r) => r.repo === ghesRepo.repo);

		if (foundRepo) {
			obj.updatedAt = foundRepo.updatedAt;
			obj.hasChanged = compareRepos(foundRepo, ghesRepo);
			obj.isNewRepo = false;
			obj.ghecUpdatedAt = foundRepo.updatedAt;

			if (canDelete) {
				await deleteRepos({
					repo: ghesRepo.repo,
					organization: ghecOrg,
					token,
				});
			}
		}

		stringifier.write(ghesRepo);
	}

	stringifier.end();
};

export default ghesLastCommitCheck;