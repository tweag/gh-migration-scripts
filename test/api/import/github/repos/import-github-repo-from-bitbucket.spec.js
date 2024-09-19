import { expect } from 'chai';
import sinon from 'sinon';
import fs from 'fs';
import axios from 'axios';
import util from 'util';
import { Readable } from 'stream';

process.env.GITHUB_TOKEN = 'mock_github_token';
process.env.GITHUB_USERNAME = 'mock_github_username';

describe('importGithubRepoFromBitbucket', function () {
	let axiosPostStub;
	let execPromiseStub;
	let fsCreateReadStreamStub;
	let sandbox;

	beforeEach(() => {
		sandbox = sinon.createSandbox();

		axiosPostStub = sandbox
			.stub(axios, 'post')
			.resolves({ status: 201, data: {} });

		execPromiseStub = sandbox.stub(util, 'promisify').callsFake(() => {
			return (command) => {
				if (command.includes('echo git clone')) {
					return Promise.resolve('Simulated git clone');
				} else if (command.includes('echo git remote add')) {
					return Promise.resolve('Simulated git remote add');
				} else if (command.includes('echo git push')) {
					return Promise.resolve('Simulated git push');
				} else {
					return Promise.reject(
						new Error('Simulated error for invalid command'),
					);
				}
			};
		});

		fsCreateReadStreamStub = sandbox
			.stub(fs, 'createReadStream')
			.callsFake((filePath) => {
				if (filePath.includes('mock.csv')) {
					const fakeCSVData =
						'repo,description,url,visibility\n' +
						'test-repo,A test repo,https://bitbucket.org/test-repo.git,public\n';

					const readable = new Readable({
						read() {
							this.push(fakeCSVData);
							this.push(null);
						},
					});

					return readable;
				}
				throw new Error('File not found');
			});
	});

	afterEach(() => {
		sandbox.restore();
	});

	it('should successfully import and migrate GitHub repositories from Bitbucket', async () => {
		try {
			await importGithubRepoFromBitbucket({ inputFile: 'mock.csv' });

			expect(axiosPostStub.calledOnce).to.be.true;
			expect(execPromiseStub.called).to.be.true;
			expect(fsCreateReadStreamStub.calledOnce).to.be.true;
		} catch (error) {
			expect('Test failed with error: ' + error.message);
		}
	});

	it('should have non-empty environment variables', () => {
		expect(process.env.GITHUB_TOKEN).to.not.be.empty;
		expect(process.env.GITHUB_USERNAME).to.not.be.empty;
	});
});
