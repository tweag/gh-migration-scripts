#!/usr/bin/env node

import Ora from 'ora';
import fs from 'fs';
import {
	delay,
	getDate,
	getStringifier,
	doRequest,
	showGraphQLErrors,
} from '../../../../services/utils.js';
import processTeamsMembers from '../../../../services/process-teams-members.js';
import processTeamsRepos from '../../../../services/process-teams-repos.js';
import https from 'https';

const spinner = Ora();
const githubGraphQL = 'https://api.github.com/graphql';

const metrics = [];

/**
 * Valid user options
 */
let opts = {};

/**
 * Initial fetched teams in Organization
 */
let fetched = {};

/**
 * Count number of team
 */
let count = 0;

export const fetchTeamInOrg = async (
	org,
	token,
	serverUrl,
	allowUntrustedSslCertificates,
	cursor,
) => {
	const config = fetchTeamInOrgInfoOptions(
		org,
		token,
		allowUntrustedSslCertificates,
		cursor,
	);
	config.url = determineGraphQLEndpoint(serverUrl);

	return doRequest(config);
};

export const fetchReposInTeam = async (
	org,
	team,
	token,
	serverUrl,
	allowUntrustedSslCertificates,
	cursor,
) => {
	const config = fetchReposInTeamOptions(
		org,
		team,
		token,
		allowUntrustedSslCertificates,
		cursor,
	);
	config.url = determineGraphQLEndpoint(serverUrl);

	return doRequest(config);
};

export const fetchMembersInTeam = async (
	org,
	team,
	token,
	serverUrl,
	allowUntrustedSslCertificates,
	cursor,
) => {
	const config = fetchMembersInTeamOptions(
		org,
		team,
		token,
		allowUntrustedSslCertificates,
		cursor,
	);
	config.url = determineGraphQLEndpoint(serverUrl);

	return doRequest(config);
};

export const getTeams = async (options) => {
	count = 0;
	opts = options;
	const response = await fetchTeamInOrg(
		options.organization,
		options.token,
		options.serverUrl,
		options.allowUntrustedSslCertificates,
		'',
	);

	showGraphQLErrors(response);
	fetched = response.data;

	// Successful Authorization
	spinner.succeed('Authorized with GitHub\n');
	await fetchingController();
};

export const fetchingController = async () => {
	await fetchTeamMetrics(fetched.data.organization.teams.edges);

	if (metrics) {
		const org = opts.organization.replace(/\s/g, '');
		await storeTeamMetrics(org);
	}
};

const processRepos = (edges) => {
	return edges.map((edge) => `${edge.node.name}:${edge.permission}`).join(';');
};

const processMembers = (edges) => {
	return edges
		.map((edge) =>
			[edge.node.login.toLowerCase(), edge.node.email, edge.role].join(':'),
		)
		.join(';');
};

export const fetchTeamMetrics = async (teams) => {
	for (const team of teams) {
		spinner.start(
			`(${count}/${fetched.data.organization.teams.totalCount}) Fetching metrics for team ${team.node.name}`,
		);

		let members = team.node.members.edges;
		let membersHasNextPage = team.node.members.pageInfo.hasNextPage;
		let membersEndCursor = team.node.members.pageInfo.endCursor;

		while (membersHasNextPage) {
			await delay(Number(opts.waitTime) * 4);
			const membersFetched = await fetchMembersInTeam(
				opts.organization,
				team.node.slug,
				opts.token,
				opts.serverUrl,
				opts.allowUntrustedSslCertificates,
				`, after: "${membersEndCursor}"`,
			);

			const memberTeam = membersFetched.data.data.organization.team;
			members = [...members, ...memberTeam.members.edges];
			membersHasNextPage = memberTeam.members.pageInfo.hasNextPage;
			membersEndCursor = memberTeam.members.pageInfo.endCursor;
		}

		let repositories = team.node.repositories.edges;
		let repositoriesHasNextPage = team.node.repositories.pageInfo.hasNextPage;
		let repositoriesEndCursor = team.node.repositories.pageInfo.endCursor;

		while (repositoriesHasNextPage) {
			await delay(Number(opts.waitTime) * 4);
			const repositoriesFetched = await fetchReposInTeam(
				opts.organization,
				team.node.slug,
				opts.token,
				opts.serverUrl,
				opts.allowUntrustedSslCertificates,
				`, after: "${repositoriesEndCursor}"`,
			);

			const repoTeam = repositoriesFetched.data.data.organization.team;
			repositories = [...repositories, ...repoTeam.repositories.edges];
			repositoriesHasNextPage = repoTeam.repositories.pageInfo.hasNextPage;
			repositoriesEndCursor = repoTeam.repositories.pageInfo.endCursor;
		}

		const teamInfo = {
			name: team.node.name,
			combinedSlug: team.node.combinedSlug,
			createdAt: team.node.createdAt,
			id: team.node.databaseId,
			description: team.node.description,
			privacy: team.node.privacy,
			repositoriesResourcePath: team.node.repositoriesResourcePath,
			slug: team.node.slug,
			resourcePath: team.node.resourcePath,
			updatedAt: team.node.updatedAt,
			url: team.node.url,
			parentTeam: team.node.parentTeam ? team.node.parentTeam.slug : null,
			parentTeamId: team.node.parentTeam
				? team.node.parentTeam.databaseId
				: null,
			repositoriesUrl: team.node.repositoriesUrl,
			childTeams: team.node.childTeams.totalCount,
			repositories: processRepos(repositories),
			repositoriesCount: team.node.repositories.totalCount,
			members: processMembers(members),
			membersCount: team.node.members.totalCount,
		};

		count = count + 1;
		metrics.push(teamInfo);
		spinner.succeed(
			`(${count}/${fetched.data.organization.teams.totalCount}) Fetching metrics for team ${team.node.name}`,
		);
	}

	// paginating calls
	// if there are more than batchSize teams
	// fetch the next batchSize teams
	if (teams.length == opts.batchSize) {
		// get cursor to last team
		spinner.start(
			`(${count}/${fetched.data.organization.teams.totalCount}) Fetching next ${opts.batchSize} teams`,
		);
		const cursor = teams[teams.length - 1].cursor;
		const result = await fetchTeamInOrg(
			opts.organization,
			opts.token,
			opts.serverUrl,
			opts.allowUntrustedSslCertificates,
			`, after: "${cursor}"`,
		);

		spinner.succeed(
			`(${count}/${fetched.data.organization.teams.totalCount}) Fetched next ${opts.batchSize} teams`,
		);

		await delay(opts.waitTime);
		await fetchTeamMetrics(result.data.data.organization.teams.edges);
	}
};

export const storeTeamMetrics = async (organization) => {
	const dir = `./${organization}-metrics`;

	if (!opts.outputFile && !fs.existsSync(dir)) {
		fs.mkdirSync(dir);
	}

	const today = getDate();
	const suffix = opts.serverUrl ? `${today}-ghes` : `${today}-ghec`;

	let path = `${dir}/${organization}-team-metrics-${suffix}.csv`;
	let membersPath = `${dir}/${organization}-member-team-role-${suffix}.csv`;
	let reposPath = `${dir}/${organization}-repo-team-permission-${suffix}.csv`;

	if (opts.outputFile) {
		path = opts.outputFile;
		membersPath =
			opts.outputFile.split('.csv')[0] + `-member-team-role-${suffix}.csv`;
		reposPath =
			opts.outputFile.split('.csv')[0] + `-repo-team-permission-${suffix}.csv`;
	}

	const stringifier = getStringifier(path);
	spinner.start('Exporting...');

	for (const metric of metrics) {
		stringifier.write(metric);
	}

	processTeamsMembers(metrics, membersPath, opts);
	processTeamsRepos(metrics, reposPath);

	spinner.succeed(`Exporting Completed: ${path}`);
	spinner.succeed(`Exporting Completed: ${membersPath}`);
	spinner.succeed(`Exporting Completed: ${reposPath}`);
};

export function determineGraphQLEndpoint(url) {
	if (!url) {
		return githubGraphQL;
	} else {
		return url + '/api/graphql';
	}
}

export function fetchReposInTeamOptions(
	org,
	team,
	token,
	allowUntrustedSslCertificates,
	cursor,
) {
	let fetchOptions = {
		method: 'post',
		maxBodyLength: Infinity,
		headers: {
			Authorization: `bearer ${token}`,
		},
		data: JSON.stringify({
			query: `{
        rateLimit {
          limit
          cost
          remaining
          resetAt
        }
        organization(login: "${org}") {
          team(slug: "${team}"){
            repositories(first: ${Number(opts.batchSize)}${cursor}) {
              totalCount
              pageInfo {
                startCursor
                hasNextPage
                hasPreviousPage
                endCursor
              }
              edges {
                permission
                cursor
                node {
                  name
                }
              }
            }
          }
        }
      }`,
		}),
	};
	if (allowUntrustedSslCertificates) {
		fetchOptions.httpsAgent = new https.Agent({ rejectUnauthorized: false });
	}
	return fetchOptions;
}

export function fetchMembersInTeamOptions(
	org,
	team,
	token,
	allowUntrustedSslCertificates,
	cursor,
) {
	let fetchOptions = {
		method: 'post',
		maxBodyLength: Infinity,
		headers: {
			Authorization: `bearer ${token}`,
		},
		data: JSON.stringify({
			query: `{
        rateLimit {
          limit
          cost
          remaining
          resetAt
        }
        organization(login: "${org}") {
          team(slug: "${team}"){
            name
            members(first: ${Number(opts.batchSize)}${cursor}) {
              totalCount
              pageInfo {
                startCursor
                hasNextPage
                hasPreviousPage
                endCursor
              }
              edges {
                role
                cursor
                node {
                  login
                  email
                }
              }
            }
          }
        }
      }`,
		}),
	};
	if (allowUntrustedSslCertificates) {
		fetchOptions.httpsAgent = new https.Agent({ rejectUnauthorized: false });
	}
	return fetchOptions;
}

export function fetchTeamInOrgInfoOptions(
	org,
	token,
	allowUntrustedSslCertificates,
	cursor,
) {
	let fetchOptions = {
		method: 'post',
		maxBodyLength: Infinity,
		headers: {
			Authorization: `bearer ${token}`,
		},
		data: JSON.stringify({
			query: `{
        rateLimit {
          limit
          cost
          remaining
          resetAt
        }
        organization(login: "${org}") {
          teams(first: ${Number(opts.batchSize)}${cursor}){
            totalCount
            edges {
              cursor
              node {
                combinedSlug
                createdAt
                databaseId
                description
                id
                name
                privacy
                repositoriesResourcePath
                resourcePath
                slug
                updatedAt
                childTeams(first: 1) {
                  totalCount
                }
                parentTeam {
                  databaseId
                  slug
                }
                repositoriesUrl
                repositories(first: ${Number(opts.batchSize)}) {
                  totalCount
                  pageInfo {
                    startCursor
                    hasNextPage
                    hasPreviousPage
                    endCursor
                  }
                  edges {
                    permission
                    cursor
                    node {
                      name
                    }
                  }
                }
                members(first:${Number(opts.batchSize)}) {
                  totalCount
                  pageInfo {
                    startCursor
                    hasNextPage
                    hasPreviousPage
                    endCursor
                  }
                  edges {
                    cursor
                    role
                    node {
                      login
                      email
                    }
                  }
                }
              }
            }
          }
        }
      }`,
		}),
	};
	if (allowUntrustedSslCertificates) {
		fetchOptions.httpsAgent = new https.Agent({ rejectUnauthorized: false });
	}
	return fetchOptions;
}
