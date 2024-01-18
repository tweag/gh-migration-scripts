import { jest } from '@jest/globals';
import { doRequest, getData } from '../../../../services/utils.js';
import setGithubArchivedStatus, {
	archiveRequest,
} from './set-github-archived-status.js';

// Mocking necessary dependencies
jest.mock('../../../../services/utils.js');

describe('setGithubArchivedStatus Function', () => {
	beforeEach(() => {
		// Reset mocks before each test
		jest.clearAllMocks();
	});

	// Mocking doRequest from utils.js
	doRequest.mockResolvedValue({ data: {} });

	test('it should set archived status for a single repository', async () => {
		const options = {
			repo: 'example-repo',
			organization: 'example-org',
			unarchive: false,
			outputFile: 'output.csv',
			waitTime: 1000,
			skip: 0,
		};

		// Mocking archiveRequest to return a promise with data
		doRequest.mockResolvedValue({
			data: {
				/* Mocked response data */
			},
		});

		// Execute the function
		await setGithubArchivedStatus(options);

		// Assertions
		expect(archiveRequest).toHaveBeenCalledWith('example-repo', true, options);
		expect(
			doRequest,
		).toHaveBeenCalledWith(/* expected arguments for doRequest */);
		// Add more assertions based on the specific behavior of setGithubArchivedStatus
	});

	test('it should set archived status for multiple repositories from a file', async () => {
		const options = {
			inputFile: 'repositories.csv',
			organization: 'example-org',
			unarchive: true,
			outputFile: 'output.csv',
			waitTime: 1000,
			skip: 0,
		};

		// Mocking getData to return a promise with data
		getData.mockResolvedValue([
			{ repo: 'example-repo-1' },
			{ repo: 'example-repo-2' },
		]);

		// Mocking archiveRequest to return a promise with data
		doRequest.mockResolvedValue({
			data: {
				/* Mocked response data */
			},
		});

		// Execute the function
		await setGithubArchivedStatus(options);

		// Assertions
		expect(archiveRequest).toHaveBeenCalledTimes(2); // Number of repositories in the CSV
		expect(
			doRequest,
		).toHaveBeenCalledWith(/* expected arguments for doRequest */);
		// Add more assertions based on the specific behavior of setGithubArchivedStatus
	});

	test('it should skip specified number of repositories', async () => {
		const options = {
			inputFile: 'repositories.csv',
			organization: 'example-org',
			unarchive: true,
			outputFile: 'output.csv',
			waitTime: 1000,
			skip: 1, // Skip the first repository
		};

		// Mocking getData to return a promise with data
		getData.mockResolvedValue([
			{ repo: 'example-repo-1' },
			{ repo: 'example-repo-2' },
		]);

		// Mocking archiveRequest to return a promise with data
		doRequest.mockResolvedValue({
			data: {
				/* Mocked response data */
			},
		});

		// Execute the function
		await setGithubArchivedStatus(options);

		// Assertions
		expect(archiveRequest).toHaveBeenCalledTimes(1); // Only the second repository should be processed
		expect(
			doRequest,
		).toHaveBeenCalledWith(/* expected arguments for doRequest */);
		// Add more assertions based on the specific behavior of setGithubArchivedStatus
	});

	test('it should handle unarchiving of repositories', async () => {
		const options = {
			repo: 'example-repo',
			organization: 'example-org',
			unarchive: true,
			outputFile: 'output.csv',
			waitTime: 1000,
			skip: 0,
		};

		// Mocking archiveRequest to return a promise with data
		doRequest.mockResolvedValue({
			data: {
				/* Mocked response data */
			},
		});

		// Execute the function
		await setGithubArchivedStatus(options);

		// Assertions
		expect(archiveRequest).toHaveBeenCalledWith('example-repo', false, options);
		expect(
			doRequest,
		).toHaveBeenCalledWith(/* expected arguments for doRequest */);
		// Add more assertions based on the specific behavior of setArchivedStatus when unarchiving
	});

	test('it should handle errors and log them', async () => {
		const options = {
			repo: 'example-repo',
			organization: 'example-org',
			unarchive: false,
			outputFile: 'output.csv',
			waitTime: 1000,
			skip: 0,
		};

		// Mocking archiveRequest to simulate an error
		doRequest.mockRejectedValue({
			/* Mocked error object */
		});

		// Execute the function
		await setArchivedStatus(options);

		// Assertions
		expect(archiveRequest).toHaveBeenCalledWith('example-repo', true, options);
		expect(
			doRequest,
		).toHaveBeenCalledWith(/* expected arguments for doRequest */);
		// Add more assertions based on the specific behavior of setArchivedStatus when an error occurs
	});
});
