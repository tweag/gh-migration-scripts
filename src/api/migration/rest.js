/*
3 possible ways to run this script:

1. Need to pass the github token and migration GUID.
  Repositories will be fetched from the migration status endpoint.
  Example: `node rest.js --token YOUR_GITHUB_TOKEN --guid YOUR_MIGRATION_GUID`

2. Set the token in environment variables.
  Repositories will be fetched from the migration status endpoint.
  export GITHUB_TOKEN=YOUR_GITHUB_TOKEN
  Example: `node rest.js --guid YOUR_MIGRATION_GUID`

3. Reads repositories from a file.
  Example: `node rest.js --file /path/to/repositories.txt --token YOUR_GITHUB_TOKEN --guid YOUR_MIGRATION_GUID
*/

import axios from 'axios';
import Table from 'cli-table';
import fs from 'fs';
import { program } from 'commander';

program
  .option('-t, --token <token>', 'GitHub authentication token (optional if GITHUB_TOKEN env var is set)')
  .requiredOption('-g, --guid <guid>', 'Migration GUID')
  .option('-f, --file <file>', 'Input file containing repository names (optional)')

program.parse();
const options = program.opts();

const authToken = options.token || process.env.GITHUB_TOKEN;
const migrationGUID = options.guid;
const inputFilePath = options.file;

if (!authToken) {
  console.error('Please provide a GitHub authentication token via the --token option or the GITHUB_TOKEN environment variable');
  process.exit(1);
}

if (!migrationGUID) {
  program.help();
}

const apiEndpoint = 'https://api.github.com';
const migrationStatusEndpoint = '/migrations';

async function getMigrationRepositories() {
  const response = await axios.get(`${apiEndpoint}${migrationStatusEndpoint}/${migrationGUID}/repositories`, {
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Accept': 'application/vnd.github.wyandotte-preview+json'
    }
  });
  return response.data;
}

async function getMigrationStatus(repositoryName) {
  const response = await axios.get(`${apiEndpoint}${migrationStatusEndpoint}/${migrationGUID}/repositories/${repositoryName}`, {
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Accept': 'application/vnd.github.wyandotte-preview+json'
    }
  });
  return response.data;
}

async function displayMigrationStatusTable() {
  try {
    let repositories = [];

    if (inputFilePath) {
      const fileContent = fs.readFileSync(inputFilePath, 'utf-8').trim();
      repositories = fileContent.split('\n');
    } else {
      const migrationRepositories = await getMigrationRepositories();
      repositories = migrationRepositories.map(repo => repo.name);
    }

    const table = new Table({
      head: ['Repository Name', 'Migration Status'],
      colWidths: [40, 20]
    });

    for (const repositoryName of repositories) {
      const migrationStatus = await getMigrationStatus(repositoryName);
      table.push([repositoryName, migrationStatus.state]);
    }

    console.log(table.toString());
  } catch (error) {
    console.error('Error displaying migration status:', error);
  }
}

displayMigrationStatusTable();
