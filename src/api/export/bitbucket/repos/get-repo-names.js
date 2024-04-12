import axios from 'axios';

const username = 'USERNAME';
const password = 'PASSWORD';
const workspace = 'WORKSPACE_NAME';
const baseUrl = 'https://api.bitbucket.org/2.0';
const auth = { username, password };

function formatBytes(bytes, unit) {
  const units = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  const factor = 1024;
  let index = 0;

  while (bytes >= factor && index < units.length - 1) {
    bytes /= factor;
    index++;
  }

  const roundedBytes = Math.round(bytes * 100) / 100;
  const unitIndex = units.indexOf(unit) !== -1 ? units.indexOf(unit) : index;

  return `${roundedBytes} ${units[unitIndex]}`;
}

async function getRepositories() {
  const repos = [];
  const pageLength = 100; // Number of repositories per page
  const partials = '&fields=values.slug,values.name,next';
  let nextPage = `${baseUrl}/repositories/${workspace}?start=${0}&pagelen=${pageLength}` + partials;
  console.log('Started fetching repositories...');

  while (true) {
    try {
      const response = await axios.get(nextPage + partials, { auth });
      repos.push(...response.data.values);
      const next = response.data.next;

      if (next) {
        nextPage = next;
      } else {
        break;
      }
    } catch (error) {
      console.error('Error getting list of repositories:', error.response.data);
      break;
    }
  }

  console.log('Repositories fetched successfully.');
  return repos;
}

getRepositories()
  .then(repos => {
    repos.forEach(repo => {
      const repoSlug = repo.slug;
      const repoName = repo.name;

      axios.get(`${baseUrl}/repositories/${workspace}/${repoSlug}` + '?fields=size', { auth })
        .then(repoResponse => {
          const repoSizeBytes = repoResponse.data.size;
          const repoSizeKiB = formatBytes(repoSizeBytes, 'KiB');
          console.log(`Repository: ${repoName}, Size: ${repoSizeKiB}`);
        })
        .catch(error => {
          console.error(`Error getting size for repository ${repoName}:`, error.response.data);
        });
    });
  })
  .catch(error => {
    console.error('Error getting list of repositories:', error.response.data);
  });
