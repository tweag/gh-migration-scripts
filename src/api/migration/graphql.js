/*
2 possible ways to run this script:

1. Need to pass the github token and migration GUID.
  Repositories will be fetched from the migration status endpoint.
  Example: `node graphql.js --token YOUR_GITHUB_TOKEN --guid YOUR_MIGRATION_GUID --org YOUR_ORGANIZATION_NAME`

2. Set the token in environment variables.
  Repositories will be fetched from the migration status endpoint.
  export GITHUB_TOKEN=YOUR_GITHUB_TOKEN
  Example: `node graphql.js --guid YOUR_MIGRATION_GUID --org YOUR_ORGANIZATION_NAME`
*/

import axios from 'axios';
import Table from 'cli-table';
import { program } from 'commander';

program
  .option('-t, --token <token>', 'GitHub authentication token (optional if GITHUB_TOKEN env var is set)')
  .requiredOption('-g, --guid <guid>', 'Migration GUID')
  .requiredOption('-o, --org <org>', 'GitHub organization name')

program.parse();
const options = program.opts();

const authToken = options.token || process.env.GITHUB_TOKEN;
const migrationGUID = options.guid;
const orgName = options.org;

if (!authToken) {
  console.error('Please provide a GitHub authentication token via the --token option or the GITHUB_TOKEN environment variable');
  process.exit(1);
}

if (!migrationGUID || !orgName) {
  program.help();
}

// const apiEndpoint = 'https://api.github.com/graphql';
const apiEndpoint = 'https://yez8v.wiremockapi.cloud';

const query = `
  query($migrationGUID: UUID!, $endCursor: String) {
    organization(login: "${orgName}") {
      repositoryMigrations(migrationGuid: $migrationGUID, first: 100, after: $endCursor) {
        nodes {
          repositoryName
          state
        }
        pageInfo {
          endCursor
          hasNextPage
        }
      }
    }
  }
`;

async function getMigrationStatus(endCursor = null) {
  try {
    const response = await axios.post(
      apiEndpoint,
      {
        query,
        variables: { migrationGUID, endCursor }
      },
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const { nodes, pageInfo } = response.data.data.organization.repositoryMigrations;
    const hasNextPage = pageInfo.hasNextPage;
    const nextCursor = pageInfo.endCursor;

    return { nodes, hasNextPage, nextCursor };
  } catch (error) {
    if (error.response.status >= 500) {
      console.error('Retrying in 5 minutes...');
      setTimeout(() => getMigrationStatus(endCursor), 5 * 60 * 1000);
    } else {
      process.exit(1);
    }
  }
}

async function displayMigrationStatusTable() {
  let endCursor = null;
  let hasNextPage = true;

  while (hasNextPage) {
    const { nodes, hasNextPage: nextPageExists, nextCursor } = await getMigrationStatus(endCursor);
    const table = new Table({
      head: ['Repository Name', 'Migration Status'],
      colWidths: [40, 20]
    });

    for (const repository of nodes) {
      table.push([repository.repositoryName, repository.state]);
    }

    console.log(table.toString());

    hasNextPage = nextPageExists;
    endCursor = nextCursor;
  }
}

displayMigrationStatusTable();
