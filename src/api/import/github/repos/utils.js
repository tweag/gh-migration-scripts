import setGithubArchivedStatus from './set-github-archived-status.js';

export const archiveFunction = async (options, repo, output, archiveStatus) => {
	options.outputFile = undefined;
	options.repo = repo;
	options.unarchive = archiveStatus;
	await setGithubArchivedStatus(options);
	options.outputFile = output;
};
