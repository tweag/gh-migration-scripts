import Table from 'cli-table';
import exportGithubRepos from './export-github-repos.js';
import getGitlabRepositories from '../../gitlab/repos/export-gitlab-repos.js';
import exportGithubReposMigrationStatus from './export-github-repos-migration-status.js';
import { GITHUB_HOST, GITLAB_HOST } from '../../../../services/constants.js';
import { getStringifier, getData } from '../../../../services/utils.js';
import * as speak from '../../../../services/style-utils.js';
import { tableChars } from '../../../../services/style-utils.js';

const tableHead = ['No.', 'Missing Repository'].map((h) => speak.successColor(h));

const getRepoNames = async (options, gitHost, sourceFile) => {
	if (sourceFile) {
		const repos = await getData(sourceFile);
		return repos.map((repo) => repo.name);
	}

	let repos = [];
	options.organization = options.sourceOrg;
	options.token = options.sourceToken;

	if (gitHost === GITHUB_HOST) {
		repos = await exportGithubRepos(options);
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

const getOutputFileName = (outputFile, sourceOrg, ghecOrg) => {
	if (outputFile && outputFile.endsWith('.csv')) return outputFile;
	return `${sourceOrg}-${ghecOrg}-ghec-missing-repos-${currentTime()}.csv`
}

const exportGithubMissingRepos = async (options) => {
	try {
		const {
			sourceOrg,
			organization: ghecOrg,
			gitHost,
			sourceFile,
			outputFile,
			token,
		} = options;
		const outputFileName = getOutputFileName(outputFile, sourceOrg, ghecOrg);
		const stringifier = getStringifier(outputFileName, ['repo']);
		const table = new Table({
			chars: tableChars,
			head: tableHead,
		});
		const repoNames = await getRepoNames(options, gitHost, sourceFile);

		options.organization = ghecOrg;
		options.token = token;
		const migratedRepos = await exportGithubReposMigrationStatus(options);
		const missingRepos = getMissingRepos(repoNames, migratedRepos);

		for (let i = 0; i < missingRepos.length; i++) {
			const repoName = missingRepos[i];
			table.push([`${i + 1}.`, repoName]);
			stringifier.write({ repo: repoName });
		}

		stringifier.end();
		console.log('\n' + table.toString());
	} catch (error) {
		speak.error(error);
	}
};

export default exportGithubMissingRepos;
