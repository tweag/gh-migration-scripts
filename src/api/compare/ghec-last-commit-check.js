#!/usr/bin/env node

import { deleteRepos } from '../import/ghec/repos/delete-repos.js';
import {
	getData,
	getStringifier,
	currentTime,
} from '../../services/utils.js';

const columns = [
	'repo',
	'pushedAt',
	'ghecUpdatedAt',
	'hasChanged',
	'isNewRepo',
];

const updateFieldMap = {
  'github': 'pushedAt',
  'gitlab': 'last_activity_at',
}

const compareRepos = (ghecUpdatedAt, sourceUpdatedAt) => {
	const ghecUpdatedAtTime = new Date(ghecUpdatedAt).getTime();
	const sourceUpdatedAtTime = new Date(sourceUpdatedAt).getTime();

	return ghecUpdatedAtTime < sourceUpdatedAtTime;
}

const ghecLastCommitCheck = async (options) => {
	const {
		ghecFile,
		sourceFile,
		ghecOrg,
		sourceOrg,
		token,
		outputFile,
		// delete: canDelete,
    gitHost,
	} = options;

	const outputFileName =
		(outputFile && outputFile.endsWith('.csv') && outputFile) ||
		`${sourceOrg}-${ghecOrg}-last-commit-check-${currentTime()}.csv`;
	const stringifier = getStringifier(outputFileName, columns);
	const ghecRepos = await getData(ghecFile);
	const sourceRepos = await getData(sourceFile);

	for (let sourceRepo of sourceRepos) {
    const sourceUpdatedAt = sourceRepo[updateFieldMap[gitHost]];
		const obj = {
			repo: sourceRepo.repo,
			updatedAt: sourceUpdatedAt,
			ghecUpdatedAt: '',
			hasChanged: false,
			isNewRepo: true,
		};
		const foundRepo = ghecRepos.find((r) => r.repo === sourceRepo.repo);

		if (foundRepo) {
			obj.hasChanged = compareRepos(foundRepo.updatedAt, sourceUpdatedAt);
			obj.isNewRepo = false;
			obj.ghecUpdatedAt = foundRepo.updatedAt;

			// if (canDelete) {
			// 	await deleteRepos({
			// 		repo: sourceRepo.repo,
			// 		organization: ghecOrg,
			// 		token,
			// 	});
			// }
		}

		stringifier.write(sourceRepo);
	}

	stringifier.end();
};

export default ghecLastCommitCheck;
