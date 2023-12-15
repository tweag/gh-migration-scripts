#!/usr/bin/env node

import { getStringifier } from './utils.js';

const processRepos = (repos, slug, stringifier) => {
	if (repos) {
		const reposArray = repos.split(';');

		for (const repoInfo of reposArray) {
			const [repo, permission] = repoInfo.split(':');
			stringifier.write({ repo, team: slug, permission });
		}
	}
};

const processTeamsRepos = async (teams, path) => {
	const columns = ['repo', 'team', 'permission'];
	const stringifier = getStringifier(path, columns);

	for (const team of teams) {
		const { slug, repositories } = team;
		processRepos(repositories, slug, stringifier);
	}

	stringifier.end();
};

export default processTeamsRepos;
