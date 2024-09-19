import { expect } from 'chai';
import fs from 'fs';
import path from 'path';

describe('src/index.js', function () {
	let fileContent;

	before(function () {
		const filePath = path.resolve('src/index.js');
		fileContent = fs.readFileSync(filePath, 'utf8');
	});

	it('should have the import statement for program', function () {
		const importProgram = "import { program } from 'commander';";

		expect(fileContent).to.include(
			importProgram,
			'The import statement for program should be present in src/index.js',
		);
	});

	it('should have the import statement for commandController', function () {
		const importCommandController =
			"import { commandController } from './commands/commands.js';";

		expect(fileContent).to.include(
			importCommandController,
			'The import statement for commandController should be present in src/index.js',
		);
	});
	it('should have the import statement for getFunctionName', function () {
		const importGetFunctionName =
			"import { getFunctionName } from './services/utils.js';";

		expect(fileContent).to.include(
			importGetFunctionName,
			'The import statement for importGetFunctionName should be present in src/index.js',
		);
	});
});
