#!/usr/bin/env node

import Ora from 'ora';
import fs from 'node:fs';
import { getData } from '../../../../services/utils';

const spinner = Ora();

const getScript = (repo, visibility, options) => {
	const {
		sourceOrg,
		destinationOrg,
		visibility: repoVisibility,
		sourceToken,
		destinationToken,
		ghesUrl,
	} = options;
	const strArr = [
		'gh',
		'gei',
		'migrate-repo',
		'--github-source-org',
		sourceOrg,
		'--source-repo',
		repo,
		'--github-target-org',
		destinationOrg,
		'--ghes-api-url',
		`${ghesUrl}/api/v3`,
		'--queue-only',
		'--target-repo-visibility',
		repoVisibility ? repoVisibility : visibility,
		'--github-source-pat',
		sourceToken,
		'--github-target-pat',
		destinationToken,
	];

	return strArr.join(' ') + '\n';
};

const saveScriptToFile = (scriptsArr, options) => {
	const { sourceOrg, destinationOrg, outputFile } = options;
	const path =
		(outputFile && outputFile.endsWith('.sh') && outputFile) ||
		`${sourceOrg}-${destinationOrg}-migration-script.sh`;

	for (const script of scriptsArr) {
		fs.appendFileSync(path, script);
	}
};

const generateGHESMigrationScript = async (options) => {
	spinner.start('Generating GHES migration script');
	const { file } = options;

	const rows = await getData(file);
	const scriptsArr = [];

	for (const row of rows) {
		const { repo, visibility } = row;
		const script = getScript(repo, visibility, options);
		scriptsArr.push(script);
	}

	saveScriptToFile(scriptsArr, options);
	spinner.succeed('Completed generation of migration script');
};

export default generateGHESMigrationScript;
