import { jest } from '@jest/globals';
import exportGithubRepoDirectCollaborators from './export-github-repo-direct-collaborators.js';
import * as utils from '../../../../services/utils.js';
import * as outsideCollaboratorsModule from '../users/export-github-outside-collaborators.js';

// Mocking the services/utils.js functions
jest.mock('../../services/utils.js');

// Mocking the outsideCollaborators module
jest.mock('../users/export-github-outside-collaborators.js');

describe('exportGithubRepoDirectCollaborators', () => {
	beforeEach(() => {
		// Reset mocks before each test
		jest.clearAllMocks();
	});

	test('it should fetch repo direct collaborators and save to file', async () => {
		// Mocking the getData function
		utils.getData.mockImplementation((inputFile) => {
			return Promise.resolve([
				{ repo: 'repo1' },
				{ repo: 'repo2' },
				// Add more mock data as needed
			]);
		});

		// Mocking the getOutsideCollaborators function
		outsideCollaboratorsModule.getOutsideCollaborators.mockImplementation(
			() => {
				return Promise.resolve(['outsideCollab1', 'outsideCollab2']);
			},
		);

		// Mocking the fetchRepoDirectCollaborators function
		utils.fetchRepoDirectCollaborators.mockImplementation((repo, options) => {
			return Promise.resolve({
				status: 200,
				data: [{ login: 'user1', role_name: 'admin' }],
			});
		});

		// Mocking the getStringifier function
		const mockStringifier = {
			write: jest.fn(),
			end: jest.fn(),
		};
		utils.getStringifier.mockReturnValueOnce(mockStringifier);

		// Execute the function
		await exportGithubRepoDirectCollaborators(mockOptions);

		// Assertions

		// Check if getData is called with the correct file path
		expect(utils.getData).toHaveBeenCalledWith('mockFile.csv');

		// Check if getOutsideCollaborators is called
		expect(
			outsideCollaboratorsModule.getOutsideCollaborators,
		).toHaveBeenCalledWith(mockOptions);

		// Check if fetchRepoDirectCollaborators is called for each repo
		expect(utils.fetchRepoDirectCollaborators).toHaveBeenCalledWith(
			'repo1',
			mockOptions,
		);
		expect(utils.fetchRepoDirectCollaborators).toHaveBeenCalledWith(
			'repo2',
			mockOptions,
		);
		// Add more assertions for additional repos as needed

		// Check if getStringifier is called with the correct file name and headers
		expect(utils.getStringifier).toHaveBeenCalledWith(
			'mockOrg-repo-direct-collaborators-timestamp.csv',
			['repo', 'login', 'role'],
		);

		// Check if write function of the stringifier is called with the expected data
		expect(mockStringifier.write).toHaveBeenCalledWith({
			repo: 'repo1',
			login: 'user1',
			role: 'admin',
		});
		// Add more assertions for additional data as needed

		// Check if end function of the stringifier is called
		expect(mockStringifier.end).toHaveBeenCalled();
	});
});

// Mock data for the test
const mockOptions = {
	inputFile: 'mockFile.csv',
	outsideCollaboratorsFile: 'mockOutsideCollaboratorsFile.csv',
	usersFile: 'mockUsersFile.csv',
	organization: 'mockOrg',
	outputFile: 'mockOutputFile.csv',
	waitTime: 1000,
	skip: 0,
};
