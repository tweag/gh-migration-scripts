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
import { GITHUB_GRAPHQL_API_URL } from '../../../../services/constants.js';
import https from 'https';
const spinner = Ora();

/**
 * Running PullRequest and issues array
 */
const metrics = [];

/**
 * Valid user options
 */
let opts = {};

/**
 * Initial fetched repositories in Organization
 */
let fetched = {};

/**
 * Count number of repo
 */
let count = 0;

/**
 * Org metrics
 */
const orgMetrics = {
	mostPr: 0,
	mostIssues: 0,
};

/**
 * Fetch batchSize repositories at a cursor given Organization and valid PAT
 *
 * @param {string} org the organization
 * @param {string} token the token
 * @param {string} serverUrl the graphql endpoint for a GHES instance
 * @param {boolean} allowUntrustedSslCertificate allow connections to a GitHub API endpoint that presents a SSL certificate that isn't issued by a trusted CA
 * @param {string} cursor the last repository fetched
 * @returns {[Objects]} the fetched repo information
 */
export const fetchRepoInOrg = async (
	org,
	token,
	serverUrl,
	allowUntrustedSslCertificates,
	cursor,
) => {
	const config = fetchRepoInOrgInfoOptions(
		org,
		token,
		allowUntrustedSslCertificates,
		cursor,
	);
	config.url = determineGraphQLEndpoint(serverUrl);

	return doRequest(config);
};

/**
 * Fetch org information
 *
 * @param {string} org the org
 * @param {string} token the token
 * @param {boolean} allowUntrustedSslCertificates the allow connections to a GitHub API endpoint that presents a SSL certificate that isn't issued by a trusted CA option
 * @returns {object} the fetched org information
 */
export const fetchOrgInfo = async (
	org,
	serverUrl,
	token,
	allowUntrustedSslCertificates,
) => {
	const config = fetchOrgInfoOptions(org, token, allowUntrustedSslCertificates);
	config.url = determineGraphQLEndpoint(serverUrl);

	return doRequest(config);
};

/**
 * Authorize the user with GitHub
 * Continue with fetching metics given successful authorization
 *
 * @param {object} options the options
 */
export const getRepos = async (options) => {
	count = 0;
	opts = options;
	const response = await fetchRepoInOrg(
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

	if (options.return) return metrics;
};

/**
 * Fetching and Storing metrics controller
 */
export const fetchingController = async () => {
	// fetching PR and ISSUE metrics
	await fetchRepoMetrics(fetched.data.organization.repositories.edges);

	if (metrics) {
		const org = opts.organization.replace(/\s/g, '');
		await storeRepoMetrics(org);
		await storeOrgMetrics(org);
	}

	return metrics;
};

/**
 * Fetch PR and ISSUE metrics given list of repositories in org
 *
 * @param {[Objects]} repositories the fetched repositories
 */
export const fetchRepoMetrics = async (repositories) => {
	for (const repo of repositories) {
		spinner.start(
			`(${count}/${fetched.data.organization.repositories.totalCount}) Fetching metrics for repo ${repo.node.name}`,
		);
		const repoInfo = {
			repo: repo.node.name,
			pushedAt: repo.node.pushedAt,
			updatedAt: repo.node.updatedAt,
			isArchived: repo.node.isArchived,
			visibility: repo.node.visibility.toLowerCase(),
			numOfPullRequests: repo.node.pullRequests.totalCount,
			numOfIssues: repo.node.issues.totalCount,
			numOfProjects: repo.node.projects.totalCount,
			numOfDiscussions: repo.node.discussions.totalCount,
			numOfPackages: repo.node.packages.totalCount,
			numOfReleases: repo.node.releases.totalCount,
			wikiEnabled: repo.node.hasWikiEnabled,
			diskUsage: repo.node.diskUsage,
		};

		if (opts.serverUrl && (opts.compare || opts.return)) {
			repoInfo.pullRequests = repo.node.pullRequests.edges
				.filter((item) => !item.node.closed && !item.node.merged)
				.map((item) => new Date(item.node.updatedAt).getTime());

			if (opts.compare) repoInfo.pullRequests = repoInfo.pullRequests.join(':');

			repoInfo.issues = repo.node.issues.edges
				.filter((item) => !item.node.closed)
				.map((item) => new Date(item.node.updatedAt).getTime());

			if (opts.compare) repoInfo.pullRequests = repoInfo.pullRequests.join(':');
		}

		if (!opts.return) {
			if (repo.node.pullRequests.totalCount > orgMetrics.mostPr) {
				orgMetrics.mostPr = repo.node.pullRequests.totalCount;
			}
			if (repo.node.projects.totalCount > orgMetrics.mostIssues) {
				orgMetrics.mostIssues = repo.node.projects.totalCount;
			}
		}

		count = count + 1;
		metrics.push(repoInfo);
		spinner.succeed(
			`(${count}/${fetched.data.organization.repositories.totalCount}) Fetching metrics for repo ${repo.node.name}`,
		);
	}

	// paginating calls
	// if there are more than batchSize repos
	// fetch the next batchSize repos
	if (repositories.length == opts.batchSize) {
		// get cursor to last repository
		spinner.start(
			`(${count}/${fetched.data.organization.repositories.totalCount}) Fetching next ${opts.batchSize} repos`,
		);
		const cursor = repositories[repositories.length - 1].cursor;
		const result = await fetchRepoInOrg(
			opts.organization,
			opts.token,
			opts.serverUrl,
			opts.allowUntrustedSslCertificates,
			`, after: "${cursor}"`,
		);
		spinner.succeed(
			`(${count}/${fetched.data.organization.repositories.totalCount}) Fetched next ${opts.batchSize} repos`,
		);

		await delay(opts.waitTime);
		await fetchRepoMetrics(result.data.data.organization.repositories.edges);
	}
};

/**
 * Call CSV service to export repository information
 *
 * @param {String} organization the organization
 */
export const storeRepoMetrics = async (organization) => {
	const today = getDate();
	const suffix = opts.serverUrl ? `${today}-ghes` : `${today}-ghec`;
	const dir = `./${organization}-metrics`;

	if (!opts.outputFile && !fs.existsSync(dir)) {
		fs.mkdirSync(dir);
	}

	const headers = [
		'repo',
		'pushedAt',
		'updatedAt',
		'isArchived',
		'visibility',
		'numOfPullRequests',
		'numOfIssues',
		'numOfProjects',
		'numOfDiscussions',
		'numOfPackages',
		'numOfReleases',
		'wikiEnabled',
		'diskUsage',
	];

	if (opts.serverUrl && opts.compare) {
		headers.push('pullRequests');
		headers.push('issues');
	}

	const path =
		(opts.outputFile && opts.outputFile.endsWith('.csv') && opts.outputFile) ||
		`${dir}/${organization}-repo-metrics-${suffix}.csv`;
	const archivedPath = path.split('.csv')[0] + '-archived.csv';
	const activePath = path.split('.csv')[0] + '-active.csv';
	const stringifier = getStringifier(path, headers);
	const archivedStringifier = getStringifier(archivedPath, headers);
	const activeStringifier = getStringifier(activePath, headers);
	spinner.start('Exporting...');

	for (const metric of metrics) {
		stringifier.write(metric);
		if (metric.isArchived) {
			archivedStringifier.write(metric);
		} else {
			activeStringifier.write(metric);
		}
	}

	stringifier.end();
	archivedStringifier.end();
	activeStringifier.end();
	spinner.succeed(`Exporting Completed: ${path}`);
};

/**
 * Determine if the user is targeting a GHES instance or not.
 *
 * * @param {string} serverUrl the graphql endpoint for a GHES instance
 */
export function determineGraphQLEndpoint(serverUrl) {
	if (!serverUrl) {
		return GITHUB_GRAPHQL_API_URL;
	} else {
		return serverUrl + '/api/graphql';
	}
}

/**
 * fetch options for fetchOrgInfo
 *
 * @param {string} org the org
 * @param {string} token the token
 * @param {boolean} allowUntrustedSslCertificates the allow connections to a GitHub API endpoint that presents a SSL certificate that isn't issued by a trusted CA option
 * @returns {object} the fetch options
 */
export function fetchOrgInfoOptions(org, token, allowUntrustedSslCertificates) {
	let fetchOptions = {
		method: 'post',
		maxBodyLength: Infinity,
		headers: {
			Authorization: `bearer ${token}`,
		},
		data: JSON.stringify({
			query: `{
        organization(login: "${org}") {
          projects(first: 1) {
            totalCount
          }
          membersWithRole(first: 1) {
            totalCount
          }
        }
      }`,
		}),
	};
	if (allowUntrustedSslCertificates) {
		fetchOptions.agent = new https.Agent({ rejectUnauthorized: false });
	}
	return fetchOptions;
}

/**
 * fetch options for fetchRepoInOrg
 *
 * @param {string} org the organization
 * @param {string} token the token
 * @param {boolean} allowUntrustedSslCertificates the allow connections to a GitHub API endpoint that presents a SSL certificate that isn't issued by a trusted CA option
 * @param {string} cursor the last repository fetched
 * @returns {object} the fetch options
 */
export function fetchRepoInOrgInfoOptions(
	org,
	token,
	allowUntrustedSslCertificates,
	cursor,
) {
	const first = opts.return ? Number(opts.batchSize) : '1';
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
          repositories(first: ${Number(opts.batchSize)}${cursor}){
            totalCount
            edges {
              cursor
              node {
                projects(first:1){
                  totalCount
                }
                hasWikiEnabled
                issues(first: ${first}, orderBy: { field: UPDATED_AT, direction: DESC }) {
                  totalCount
                  edges {
                    node {
                      updatedAt
                      closed
                    }
                  }
                }
                pullRequests(first: ${first}, orderBy: { field: UPDATED_AT, direction: DESC }) {
                  totalCount
                  edges {
                    node {
                      updatedAt
                      merged
                      closed
                    }
                  }
                }
                discussions(first: 1) {
                  totalCount
                }
                packages(first: 1) {
                  totalCount
                }
                releases(first: 1) {
                  totalCount
                }
                name
                id
                url
                pushedAt
                updatedAt
								visibility
                isPrivate
                isArchived
                diskUsage
              }
            }
          }
        }
      }`,
		}),
	};
	if (allowUntrustedSslCertificates) {
		fetchOptions.agent = new https.Agent({ rejectUnauthorized: false });
	}
	return fetchOptions;
}

/**
 * Store Organization information into separate CSV
 *
 * @param {String} organization the organization name
 *
 */
export const storeOrgMetrics = async (organization) => {
	const today = getDate();
	const suffix = opts.serverUrl ? `${today}-ghes` : `${today}-ghec`;
	const dir = `./${organization}-metrics`;
	let path = `${dir}/${organization}-org-metrics-${suffix}.csv`;

	if (opts.outputFile && opts.outputFile.endsWith('.csv')) {
		path = opts.outputFile.split('.')[0] + '-org-metrics.csv';
	}

	if (!opts.outputFile && !fs.existsSync(dir)) {
		fs.mkdirSync(dir);
	}

	// Total number of pull-request and issues
	const totalCount = metrics.reduce(
		(prev, current) => {
			return {
				pr: prev.pr + current.numOfPullRequests,
				issue: prev.issue + current.numOfIssues,
			};
		},
		{ pr: 0, issue: 0 },
	);

	const orgInfo = await fetchOrgInfo(
		organization,
		opts.serverUrl,
		opts.token,
		opts.allowUntrustedSslCertificates,
	);

	const storeData = [
		{
			numOfRepos: metrics.length,
			numOfProjects: orgInfo.data.data.organization.projects.totalCount,
			numOfMembers: orgInfo.data.data.organization.membersWithRole.totalCount,
			mostPrs: orgMetrics.mostPr,
			averagePrs: Math.round(totalCount.pr / metrics.length),
			mostIssues: orgMetrics.mostIssues,
			averageIssues: Math.round(totalCount.issue / metrics.length),
		},
	];

	const headers = [
		'numOfMembers',
		'numOfProjects',
		'numOfRepos',
		'mostPrs',
		'averagePrs',
		'mostIssues',
		'averageIssues',
	];

	if (storeData) {
		spinner.start('Exporting...');
		const stringifier = getStringifier(path, headers);
		stringifier.write(storeData[0]);
		stringifier.end();
		spinner.succeed(`Exporting Completed: ${path}`);
	}
};
