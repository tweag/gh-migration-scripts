import { jest } from '@jest/globals';
import { doRequest, getData } from '../../../../services/utils.js';
import importGithubTeams, {
	createSingleTeam,
	deleteMemberFromTeam,
} from './import-github-teams.js';

// Mocking necessary dependencies
jest.mock('../../../../services/utils.js');
jest.mock('./import-github-teams.js');

describe('importGithubTeams Function', () => {
	beforeEach(() => {
		// Reset mocks before each test
		jest.clearAllMocks();
	});

	// Mocking doRequest from utils.js
	doRequest.mockResolvedValue({ data: {} });

	createSingleTeam.mockResolvedValue({
		status: 'mockedStatus',
		data: { slug: 'mockedSlug' },
	});
	deleteMemberFromTeam.mockResolvedValue({ status: 'mockedStatus', data: {} });

	test('it should create teams with expected operations', async () => {
		const options = {
			inputFile: 'teamsData.csv',
			organization: 'example-org',
			outputFile: 'output.csv',
			skip: 0,
			waitTime: 1000,
			githubUser: 'example-user',
		};

		// Mocking getData to return a promise with data
		getData.mockResolvedValue([
			{
				name: 'Team1',
				description: 'Description1',
				privacy: 'VISIBLE',
				parentTeam: 'ParentTeam',
			},
		]);

		// Execute the function
		await importGithubTeams(options);

		// Assertions
		expect(createSingleTeam).toHaveBeenCalledWith({
			name: 'Team1',
			description: 'Description1',
			privacy: 'closed',
			parentTeamId: expect.any(String),
			options,
		});

		expect(deleteMemberFromTeam).toHaveBeenCalledWith(
			'mockedSlug',
			'example-user',
			options,
		);
	});
});
