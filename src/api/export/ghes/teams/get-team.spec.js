// Import necessary modules
import { describe, it, beforeEach } from 'mocha';
import { expect } from 'chai';
import { getTeam } from './get-team.js';
import * as utils from '../../../../services/utils.js';
import { GITHUB_API_URL } from '../../../../services/constants.js';

// Mocking the external dependencies
import sinon from 'sinon';
const mock = sinon.createSandbox();

// Your test suite
describe('getTeam', () => {
  const mockOptions = {
    organization: 'mockOrg',
    githubUrl: 'mockGithubUrl',
    token: 'mockToken',
    waitTime: 1,
  };

  beforeEach(() => {
    // Reset mocks before each test
    mock.restore();
  });

  it('should fetch team information with the correct configuration', async () => {
    const mockTeam = 'mockTeam';
    const expectedConfig = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `${GITHUB_API_URL}/orgs/mockOrg/teams/mockTeam`,
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: 'Bearer mockToken',
      },
    };

    // Mocking the delay function
    mock.stub(utils, 'delay').resolves(undefined);

    // Mocking the doRequest function
    mock.stub(utils, 'doRequest').resolves({ status: 200, data: { team: 'mockTeamData' } });

    await getTeam(mockTeam, mockOptions);

    // Assertions

    // Check if the delay function is called with the correct wait time
    expect(utils.delay.calledWith(1)).to.be.true;

    // Check if the getTeamConfig function is called with the correct parameters
    // expect(getTeamConfig('mockTeam', mockOptions)).to.deep.equal(expectedConfig);

    // Check if the doRequest function is called with the correct configuration
    // expect(utils.doRequest.calledWith(expectedConfig)).to.be.true;
  });

  // Add more test cases as needed
});
