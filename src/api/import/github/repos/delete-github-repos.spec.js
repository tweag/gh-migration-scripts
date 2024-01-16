import { jest } from '@jest/globals';
import deleteGithubRepos from './delete-github-repos.js';
import * as utils from '../../../../services/utils.js';

// Mocking the services/utils.js functions
jest.mock('../../../../services/utils.js');

// Mock the console.log and console.error functions to prevent actual console output during tests
global.console.log = jest.fn();
global.console.error = jest.fn();

describe('deleteGithubRepos', () => {
	beforeEach(() => {
		// Reset mocks before each test
		jest.clearAllMocks();
	});

	test('it should delete repos and generate status output', async () => {
		// Mocking the data retrieval functions
		utils.getData.mockImplementationOnce(() =>
			Promise.resolve(mockRepositories),
		);

		// Mocking the doRequest function
		utils.doRequest.mockImplementation((config) => {
			// Simulate a successful request for the first repo, and a failed request for the second repo
			if (config.url === 'mockGitHubApiUrl/repos/mockOrg/repo1') {
				return Promise.resolve({
					status: 200,
					statusText: 'OK',
					data: 'Mock deletion success response for repo1',
				});
			} else if (config.url === 'mockGitHubApiUrl/repos/mockOrg/repo2') {
				return Promise.reject({
					status: 404,
					statusText: 'Not Found',
					errorMessage: 'Mock deletion error response for repo2',
				});
			}
		});

		// Mock the delay function to prevent actual delays during tests
		utils.delay.mockImplementationOnce(() => Promise.resolve());

		// Mock the getStringifier function
		utils.getStringifier.mockReturnValueOnce({
			write: jest.fn(),
			end: jest.fn(),
		});

		// Execute the function
		await deleteGithubRepos(mockOptions);

		// Assertions

		// Check if getData is called with the correct file path
		expect(utils.getData).toHaveBeenCalledWith('mockFile.csv');

		// Check if doRequest is called with the correct config for each repo
		expect(utils.doRequest).toHaveBeenCalledWith({
			method: 'delete',
			maxBodyLength: Infinity,
			url: 'mockGitHubApiUrl/repos/mockOrg/repo1',
			headers: {
				Accept: 'application/vnd.github+json',
				Authorization: 'Bearer mockToken',
			},
		});
		expect(utils.doRequest).toHaveBeenCalledWith({
			method: 'delete',
			maxBodyLength: Infinity,
			url: 'mockGitHubApiUrl/repos/mockOrg/repo2',
			headers: {
				Accept: 'application/vnd.github+json',
				Authorization: 'Bearer mockToken',
			},
		});

		// Check if console.log is called with the expected output for each repo
		expect(global.console.log).toHaveBeenCalledWith({
			repo: 'repo1',
			status: 200,
			statusText: 'OK',
			errorMessage: '',
		});
		expect(global.console.log).toHaveBeenCalledWith({
			repo: 'repo2',
			status: 404,
			statusText: 'Not Found',
			errorMessage: 'Mock deletion error response for repo2',
		});

		// Check if getStringifier is called with the correct file name and columns
		expect(utils.getStringifier).toHaveBeenCalledWith(
			'mockOrg-delete-repos-status-mockCurrentTime.csv',
			['repo', 'status', 'statusText', 'errorMessage'],
		);

		// Check if stringifier.write is called with the expected data for each repo
		expect(utils.getStringifier().write).toHaveBeenCalledWith({
			repo: 'repo1',
			status: 200,
			statusText: 'OK',
			errorMessage: '',
		});
		expect(utils.getStringifier().write).toHaveBeenCalledWith({
			repo: 'repo2',
			status: 404,
			statusText: 'Not Found',
			errorMessage: 'Mock deletion error response for repo2',
		});

		// Check if stringifier.end is called
		expect(utils.getStringifier().end).toHaveBeenCalled();

		// Check if delay is called with the correct wait time
		expect(utils.delay).toHaveBeenCalledWith(mockOptions.waitTime);
	});
});

// Mock data for the test
const mockOptions = {
	inputFile: 'mockFile.csv',
	organization: 'mockOrg',
	outputFile: 'mockOutputFile.csv',
	waitTime: 1000,
	skip: 0,
};

const mockRepositories = [{ repo: 'repo1' }, { repo: 'repo2' }];
