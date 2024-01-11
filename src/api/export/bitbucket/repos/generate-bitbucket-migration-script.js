#!/usr/bin/env node

import Ora from 'ora';
import fs from 'node:fs';
import { getData } from '../../../../services/utils';

const spinner = Ora();

const getScript = (repo, options) => {
	const {
		destinationOrg,
    serverUrl,
    bitbucketProject,
    repo,
    sshUser,
    awsBucketName,
	} = options;
	const strArr = [
		'gh',
		'bbs2gh',
		'migrate-repo',
		'--bbs-server-url',
		serverUrl,
		'--bbs-project',
		bitbucketProject,
		'--bbs-repo',
		repo,
		'--github-org',
		destinationOrg,
		repo,
		'--ssh-user',
		sshUser,
		'--aws-bucket-name',
		awsBucketName,
	];

	return strArr.join(' ') + '\n';
};

const saveScriptToFile = (scriptsArr, options) => {
	const { destinationOrg, outputFile } = options;
	const path =
		(outputFile && outputFile.endsWith('.sh') && outputFile) ||
		`bitbucket-${destinationOrg}-migration-script.sh`;

	for (const script of scriptsArr) {
		fs.appendFileSync(path, script);
	}
};

const generateBitbucketMigrationScript = async (options) => {
	spinner.start('Generating Bitbucket migration script');
	const { file } = options;

	const rows = await getData(file);
	const scriptsArr = [];

	for (const row of rows) {
		const { repo } = row;
		const script = getScript(repo, options);
		scriptsArr.push(script);
	}

	saveScriptToFile(scriptsArr, options);
	spinner.succeed('Completed generation of migration script');
};

export default generateBitbucketMigrationScript;
