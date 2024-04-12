import axios from 'axios';

const username = 'USERNAME';
const password = 'PASSWORD';
const baseUrl = 'https://api.bitbucket.org/2.0';
const auth = { username, password };

async function getWorkspaces() {
  try {
    const response = await axios.get(`${baseUrl}/workspaces`, { auth });
    return response.data.values;
  } catch (error) {
    console.error('Error getting list of workspaces:', error.response.data);
    return [];
  }
}

// Get list of workspaces and print their names
getWorkspaces()
  .then(workspaces => {
    console.log('List of Workspaces:');
    workspaces.forEach(workspace => {
      console.log(`- ${workspace.name}`);
    });
  })
  .catch(error => {
    console.error('Error:', error.response.data);
  });
