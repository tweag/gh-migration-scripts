import fs from 'node:fs';
import readline from 'node:readline';
import { jest } from '@jest/globals';
import { getReposDirectCollaborators } from './getReposDirectCollaborators';
import * as utils from '../../../../services/utils.js';
import * as outsideCollaboratorsModule from '../users/get-outside-collaborators.js';

// Mocking the node:fs module
jest.mock('node:fs');

// Mocking the node:readline module
jest.mock('node:readline');

// Mocking the services/utils.js functions
jest.mock('../../services/utils.js');

// Mocking the outsideCollaborators module
jest.mock('../users/get-outside-collaborators.js');

describe('getReposDirectCollaborators', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  test('it should fetch repo direct collaborators and save to file', async () => {
    // Mocking the getData function
    utils.getData.mockImplementation((file) => {
      return Promise.resolve([
        { repo: 'repo1' },
        { repo: 'repo2' },
        // Add more mock data as needed
      ]);
    });

    // Mocking the getOutsideCollaborators function
    outsideCollaboratorsModule.getOutsideCollaborators.mockImplementation(() => {
      return Promise.resolve(['outsideCollab1', 'outsideCollab2']);
    });

    // Mocking the fs.createReadStream function
    const mockStream = {
      on: jest.fn().mockImplementationOnce((event, callback) => {
        if (event === 'line') {
          callback('repo1,some,data');
          callback('repo2,more,data');
          // Add more mock lines as needed
        }
        if (event === 'close') {
          callback();
        }
      }),
    };
    fs.createReadStream.mockReturnValueOnce(mockStream);

    // Mocking the fetchRepoDirectCollaborators function
    utils.fetchRepoDirectCollaborators.mockImplementation((repo, options) => {
      return Promise.resolve({ status: 200, data: [{ login: 'user1', role_name: 'admin' }] });
    });

    // Mocking the getStringifier function
    const mockStringifier = {
      write: jest.fn(),
      end: jest.fn(),
    };
    utils.getStringifier.mockReturnValueOnce(mockStringifier);

    // Execute the function
    await getReposDirectCollaborators(mockOptions);

    // Assertions

    // Check if getData is called with the correct file path
    expect(utils.getData).toHaveBeenCalledWith('mockFile.csv');

    // Check if getOutsideCollaborators is called
    expect(outsideCollaboratorsModule.getOutsideCollaborators).toHaveBeenCalledWith(mockOptions);

    // Check if createReadStream is called with the correct file path
    expect(fs.createReadStream).toHaveBeenCalledWith('mockFile.csv');

    // Check if fetchRepoDirectCollaborators is called for each repo
    expect(utils.fetchRepoDirectCollaborators).toHaveBeenCalledWith('repo1', mockOptions);
    expect(utils.fetchRepoDirectCollaborators).toHaveBeenCalledWith('repo2', mockOptions);
    // Add more assertions for additional repos as needed

    // Check if getStringifier is called with the correct file name and headers
    expect(utils.getStringifier).toHaveBeenCalledWith('mockOrg-repo-direct-collaborators-timestamp.csv', ['repo', 'login', 'role']);

    // Check if write function of the stringifier is called with the expected data
    expect(mockStringifier.write).toHaveBeenCalledWith({ repo: 'repo1', login: 'user1', role: 'admin' });
    // Add more assertions for additional data as needed

    // Check if end function of the stringifier is called
    expect(mockStringifier.end).toHaveBeenCalled();
  });
});

// Mock data for the test
const mockOptions = {
  file: 'mockFile.csv',
  outsideCollaboratorsFile: 'mockOutsideCollaboratorsFile.csv',
  usersFile: 'mockUsersFile.csv',
  organization: 'mockOrg',
  outputFile: 'mockOutputFile.csv',
  waitTime: 1000,
  skip: 0,
};
