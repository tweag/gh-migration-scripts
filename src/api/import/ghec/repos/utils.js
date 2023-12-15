import { setArchivedStatus } from './set-archived-status.js';

export const archiveFunction = async (options, repo, output, archiveStatus) => {
	options.outputFile = undefined;
	options.repo = repo;
	options.unarchive = archiveStatus;
	await setArchivedStatus(options);
	options.outputFile = output;
};
