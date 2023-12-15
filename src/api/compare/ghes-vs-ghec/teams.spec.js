import { jest } from '@jest/globals';
import { compareTeams } from './compareTeams';
import * as utils from '../../../services/utils.js';

// Mocking the services/utils.js functions
jest.mock('../../services/utils.js');

describe('compareTeams', () => {
	beforeEach(() => {
		// Reset mocks before each test
		jest.clearAllMocks();
	});

	test('it should compare teams and generate output', async () => {
		// Mocking the data retrieval functions
		utils.getData.mockImplementationOnce(() => Promise.resolve(mockGhecTeams));
		utils.getData.mockImplementationOnce(() => Promise.resolve(mockGhesTeams));
		utils.getData.mockImplementationOnce(() => Promise.resolve(mockGhecUsers));

		// Mocking the stringifier functions
		const mockStringifier = {
			write: jest.fn(),
			end: jest.fn(),
		};

		const mockRepoPermissionStringifier = {
			write: jest.fn(),
			end: jest.fn(),
		};

		const mockMemberRoleStringifier = {
			write: jest.fn(),
			end: jest.fn(),
		};

		utils.getStringifier.mockImplementationOnce(() => mockStringifier);
		utils.getStringifier.mockImplementationOnce(
			() => mockRepoPermissionStringifier,
		);
		utils.getStringifier.mockImplementationOnce(
			() => mockMemberRoleStringifier,
		);

		// Execute the function
		await compareTeams(mockOptions);

		// Assertions

		// Check if getData is called with the correct file paths
		expect(utils.getData).toHaveBeenCalledWith('mockGhecFile.csv');
		expect(utils.getData).toHaveBeenCalledWith('mockGhesFile.csv');
		expect(utils.getData).toHaveBeenCalledWith('mockGhecUsersFile.csv');

		// Check if getStringifier is called with the correct file names and headers
		expect(utils.getStringifier).toHaveBeenCalledWith(
			'mockOrg-teams-comparison.csv',
			['team', 'issue', 'repo', 'member'],
		);
		expect(utils.getStringifier).toHaveBeenCalledWith(
			'mockOrg-repo-team-permission-input.csv',
			['repo', 'team', 'permission'],
		);
		expect(utils.getStringifier).toHaveBeenCalledWith(
			'mockOrg-member-team-role-input.csv',
			['member', 'team', 'role'],
		);

		// Check if the write function is called with the expected data
		expect(mockStringifier.write).toHaveBeenCalledWith({
			team: 'team1',
			issue: 'team-missing',
		});

		// Check if the end function is called
		expect(mockStringifier.end).toHaveBeenCalled();
		expect(mockRepoPermissionStringifier.end).toHaveBeenCalled();
		expect(mockMemberRoleStringifier.end).toHaveBeenCalled();

		// Sample assertions (replace with actual assertions based on your code)
		expect(mockRepoPermissionStringifier.write).toHaveBeenCalledWith({
			repo: 'repo1',
			team: 'team1',
			permission: 'read',
		});
		expect(mockMemberRoleStringifier.write).toHaveBeenCalledWith({
			member: 'user1',
			team: 'team1',
			role: 'admin',
		});
	});
});
