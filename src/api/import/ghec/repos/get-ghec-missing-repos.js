import { getRepos } from '../../../export/ghes/repos/get-repos.js';
import getGitlabRepositories from '../../../export/gitlab/repos/get-gitlab-repos.js';
import getReposMigrationStatus from './get-repos-migration-status.js';
import { GITHUB_HOST, GITLAB_HOST } from '../../../../services/constants.js';
import { getStringifier, getData } from '../../../../services/utils.js';

const getRepoNames = async (options, gitHost, sourceFile) => {
	if (sourceFile) {
		const repos = await getData(sourceFile);
		return repos.map((repo) => repo.name);
	}

	let repos = [];
	options.organization = options.sourceOrg;
	options.token = options.sourceToken;

	if (gitHost === GITHUB_HOST) {
		repos = await getRepos(options);
	}

	if (gitHost === GITLAB_HOST) {
		repos = await getGitlabRepositories(options);
	}

	const repoNames = repos.map((repo) => repo.name);
	return repoNames;
};

const getMissingRepos = (repoNames, migratedRepos) => {
	const migratedRepoNames = migratedRepos
		.filter((repo) => repo.status != 'failed')
		.map((repo) => repo.name);
	return repoNames.filter((repo) => !migratedRepoNames.includes(repo.name));
};

const getGHECMissingRepos = async (options) => {
	const {
		sourceOrg,
		organization: ghecOrg,
		gitHost,
		sourceFile,
		outputFile,
		token,
	} = options;
	const outputFileName =
		(outputFile && outputFile.endsWith('.csv') && outputFile) ||
		`${sourceOrg}-${ghecOrg}-ghec-missing-repos-${currentTime()}.csv`;
	const stringifier = getStringifier(outputFileName, ['repo']);
	const repoNames = await getRepoNames(options, gitHost, sourceFile);

	options.organization = ghecOrg;
	options.token = token;
	const migratedRepos = await getReposMigrationStatus(options);
	const missingRepos = getMissingRepos(repoNames, migratedRepos);
	missingRepos.forEach((repoName) => stringifier.write({ repo: repoName }));

	stringifier.end();
};

export default getGHECMissingRepos;
