import Ora from 'ora';
import { jest } from '@jest/globals';
import { generateGHESMigrationScript } from './generateGHESMigrationScript';
import * as utils from '../../../../services/utils.js';

// Mocking the node:fs module
jest.mock('node:fs');

// Mocking the Ora module
jest.mock('ora');

// Mocking the services/utils.js functions
jest.mock('../../services/utils.js');

describe('generateGHESMigrationScript', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  test('it should generate GHES migration script and save to file', async () => {
    // Mocking the getData function
    utils.getData.mockImplementationOnce(() => Promise.resolve(mockRows));

    // Mocking the Ora spinner
    const startMock = jest.fn();
    const succeedMock = jest.fn();
    Ora.mockReturnValueOnce({
      start: startMock,
      succeed: succeedMock,
    });

    // Execute the function
    await generateGHESMigrationScript(mockOptions);

    // Assertions

    // Check if getData is called with the correct file path
    expect(utils.getData).toHaveBeenCalledWith('mockFile.csv');

    // Check if Ora spinner is started and succeeded
    expect(startMock).toHaveBeenCalledWith('Generating GHES migration script');
    expect(succeedMock).toHaveBeenCalledWith('Completed generation of migration script');

    // Check if getScript is called for each row
    for (const row of mockRows) {
      expect(utils.getScript).toHaveBeenCalledWith(row.repo, row.visibility, mockOptions);
    }

    // Check if saveScriptToFile is called with the correct arguments
    expect(utils.saveScriptToFile).toHaveBeenCalledWith(mockScriptsArr, mockOptions);
  });
});

// Mock data for the test
const mockOptions = {
  inputFile: 'mockFile.csv',
  sourceOrg: 'mockSourceOrg',
  destinationOrg: 'mockDestinationOrg',
  outputFile: 'mockOutputFile.sh',
};

const mockRows = [
  { repo: 'repo1', visibility: 'private' },
  { repo: 'repo2', visibility: 'public' },
];

const mockScriptsArr = [
  'gh gei migrate-repo --github-source-org mockSourceOrg --source-repo repo1 --github-target-org mockDestinationOrg --ghes-api-url mockGhesUrl/api/v3 --queue-only --target-repo-visibility private --github-source-pat mockSourceToken --github-target-pat mockDestinationToken\n',
  'gh gei migrate-repo --github-source-org mockSourceOrg --source-repo repo2 --github-target-org mockDestinationOrg --ghes-api-url mockGhesUrl/api/v3 --queue-only --target-repo-visibility public --github-source-pat mockSourceToken --github-target-pat mockDestinationToken\n',
];
