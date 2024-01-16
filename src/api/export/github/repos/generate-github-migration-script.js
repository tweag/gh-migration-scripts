#!/usr/bin/env node

import Ora from 'ora';
import fs from 'node:fs';
import { getData } from '../../../../services/utils.js';
import * as speak from '../../../../services/speak.js';

const spinner = Ora();

const getScript = (repo, visibility, options) => {
	const {
		sourceOrg,
		organization: destinationOrg,
		visibility: repoVisibility,
		sourceToken,
		token: destinationToken,
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
	const { sourceOrg, organization: destinationOrg, outputFile } = options;
	const path =
		(outputFile && outputFile.endsWith('.sh') && outputFile) ||
		`${sourceOrg}-${destinationOrg}-migration-script.sh`;

	for (const script of scriptsArr) {
		fs.appendFileSync(path, script);
	}

	speak.success(`${scriptsArr.length} repositories migration script saved to ${path} for (${sourceOrg} -> ${destinationOrg}))`);
};

const generateGithubMigrationScript = async (options) => {
	try {
		spinner.start(speak.successColor('Generating GHES migration script'));
		const { inputFile } = options;

		const rows = await getData(inputFile);
		const scriptsArr = [];

		for (const row of rows) {
			const { repo, visibility } = row;
			const script = getScript(repo, visibility, options);
			scriptsArr.push(script);
		}

		saveScriptToFile(scriptsArr, options);
	} catch (error) {
		speak.error(error);
		spinner.fail(speak.errorColor('Failed to generate GHES migration script'));
	}
};

export default generateGithubMigrationScript;
