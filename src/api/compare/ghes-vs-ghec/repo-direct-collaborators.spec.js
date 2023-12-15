import { jest } from '@jest/globals';
import compareRepoDirectCollaborators from './repo-direct-collaborators.js';

// Mocking the services/utils.js functions
jest.unstable_mockModule('../../services/utils.js', () => ({
	getData: jest.fn(),
	getStringifier: jest.fn(),
}));

const { getData, getStringifier } = await import('../../../services/utils.js');

describe('compareRepoDirectCollaborators', () => {
	// Complete mock data for testing
	const mockOptions = {
		organization: 'mockOrg',
		ghecFile: 'mockGhecFile.csv',
		ghesFile: 'mockGhesFile.csv',
		outsideCollaboratorsFile: 'mockOutsideCollaboratorsFile.csv',
		usersFile: 'mockUsersFile.csv',
	};

	const mockGhecCollaborators = [
		{ repo: 'repo1', login: 'user1', role: 'admin' },
		{ repo: 'repo1', login: 'user2', role: 'write' },
		{ repo: 'repo2', login: 'user3', role: 'read' },
		{ repo: 'repo2', login: 'user4', role: 'admin' },
	];

	const mockGhesCollaborators = [
		{ repo: 'repo1', login: 'user1', role: 'admin' },
		{ repo: 'repo2', login: 'user3', role: 'read' },
	];

	const mockOutsideCollaborators = ['user2', 'user4', 'user5'];

	const mockGhecUsers = ['user1', 'user2', 'user3'];

	beforeEach(() => {
		// Reset mocks before each test
		jest.clearAllMocks();
	});

	test('it should compare repo direct collaborators and generate output', async () => {
		// Mocking the data retrieval functions
		getData.mockImplementationOnce(() =>
			Promise.resolve(mockGhecCollaborators),
		);
		getData.mockImplementationOnce(() =>
			Promise.resolve(mockGhesCollaborators),
		);
		getData.mockImplementationOnce(() =>
			Promise.resolve(mockOutsideCollaborators),
		);
		getData.mockImplementationOnce(() => Promise.resolve(mockGhecUsers));

		// Mocking the stringifier functions
		const mockInputStringifier = {
			write: jest.fn(),
			end: jest.fn(),
		};

		const mockRemoveStringifier = {
			write: jest.fn(),
			end: jest.fn(),
		};

		getStringifier.mockImplementationOnce(() => mockInputStringifier);
		getStringifier.mockImplementationOnce(() => mockRemoveStringifier);

		await compareRepoDirectCollaborators(mockOptions);

		// Assertions

		// Check if getData is called with the correct file paths
		expect(getData).toHaveBeenCalledWith('mockGhecFile.csv');
		expect(getData).toHaveBeenCalledWith('mockGhesFile.csv');
		expect(getData).toHaveBeenCalledWith('mockOutsideCollaboratorsFile.csv');
		expect(getData).toHaveBeenCalledWith('mockUsersFile.csv');

		// Check if getStringifier is called with the correct file names and headers
		expect(getStringifier).toHaveBeenCalledWith(
			'mockOrg-repo-direct-collaborators-input.csv',
			['repo', 'login', 'role'],
		);
		expect(getStringifier).toHaveBeenCalledWith(
			'mockOrg-repo-direct-collaborators-remove.csv',
			['repo', 'login'],
		);

		// Check if the write function of inputStringifier is called with the expected data
		expect(mockInputStringifier.write).toHaveBeenCalledWith({
			repo: 'repo2',
			login: 'user2',
			role: 'write',
		});

		// Check if the end function of both stringifiers is called
		expect(mockInputStringifier.end).toHaveBeenCalled();
		expect(mockRemoveStringifier.end).toHaveBeenCalled();
	});

	// Add more test cases as needed
});
