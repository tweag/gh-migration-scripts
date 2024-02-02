#!/usr/bin/env node

import Ora from 'ora';
import { progressBar } from 'progress-bar-cli';
import Table from 'cli-table';
import fs from 'fs';
import {
	delay,
	getDate,
	getStringifier,
	doRequest,
	showGraphQLErrors,
} from '../../../../services/utils.js';
import { GITHUB_GRAPHQL_API_URL, PROGRESS_BAR_CLEAR_NUM } from '../../../../services/constants.js';
import * as speak from '../../../../services/style-utils.js';
import { tableChars } from '../../../../services/style-utils.js';
import https from 'https';
const spinner = Ora();

/**
 * Migration repos metrics array
 */
const metrics = [];

/**
 * Valid options
 */
let opts = {};

/**
 * Initial fetched migrated repositories in Organization
 */
let fetched = {};

/**
 * Count number of repo
 */
let count = 0;
let totalCount = 0;

let table;

const tableHead = ['No.', 'Repo', 'Failure Reason'].map((h) => speak.successColor(h));

/**
 * Fetch batchSize migration repositories at a cursor given Organization and valid PAT
 *
 * @param {string} org the organization
 * @param {string} token the token
 * @param {boolean} allowUntrustedSslCertificate allow connections to a GitHub API endpoint that presents a SSL certificate that isn't issued by a trusted CA
 * @param {string} cursor the last repository fetched
 * @returns {[Objects]} the fetched repo information
 */
export const fetchMigrationsRepoInOrg = async (
	org,
	token,
	allowUntrustedSslCertificates,
	cursor,
) => {
	const config = fetchMigrationsRepoInOrgInfoOptions(
		org,
		token,
		allowUntrustedSslCertificates,
		cursor,
	);
	config.url = GITHUB_GRAPHQL_API_URL;

	return doRequest(config);
};

/**
 * Authorize the user with GitHub
 * Continue with fetching metics given successful authorization
 *
 * @param {object} options the options
 */
const exportGithubReposMigrationStatus = async (options) => {
	table = new Table({
		head: tableHead,
		chars: tableChars,
	});
	count = 0;
	opts = options;
	const response = await fetchMigrationsRepoInOrg(
		options.organization,
		options.token,
		options.allowUntrustedSslCertificates,
		'',
	);
		console.log(JSON.stringify(response, null, 2));
	showGraphQLErrors(response);
	fetched = response.data;
	totalCount = fetched.data.organization.repositoryMigrations.totalCount;

	if (totalCount === 0) {
		speak.warn(`No migrations returned for organization ${options.organization}`);
		return;
	}

	// Successful Authorization
	spinner.succeed('Authorized with GitHub\n');
	await fetchingController();
};

/**
 * Fetching and Storing metrics controller
 *
 */
export const fetchingController = async () => {
	await fetchMigrationRepoMetrics(fetched.data.organization.repositoryMigrations.edges);

	const org = opts.organization.replace(/\s/g, '');
	await storeMigrationRepoMetrics(org);
	console.log('\n' + table.toString());
};

/**
 * Fetch migration repositories in org
 *
 * @param {[Objects]} repositories the fetched repositories
 */
export const fetchMigrationRepoMetrics = async (repositories) => {
	for (const repo of repositories) {
		spinner.start(
			`(${count}/${totalCount}) Fetching metrics for repo ${repo.node.name}`,
		);
		const repoInfo = {
			repo: repo.node.repositoryName,
			createdAt: repo.node.createdAt,
			state: repo.node.state,
			failureReason: repo.node.failureReason,
			warningsCount: repo.node.warningsCount,
			migrationLogUrl: repo.node.migrationLogUrl,
			sourceUrl: repo.node.sourceUrl,
		};

		count = count + 1;
		metrics.push(repoInfo);
		spinner.succeed(
			`(${count}/${totalCount}) Fetching metrics for repo ${repo.node.name}`,
		);
	}

	progressBar(count - 1, totalCount, new Date(), PROGRESS_BAR_CLEAR_NUM);

	// paginating calls
	// if there are more than batchSize repos
	// fetch the next batchSize repos
	if (repositories.length == opts.batchSize) {
		// get cursor to last repository
		spinner.start(
			`(${count}/${totalCount}) Fetching next ${opts.batchSize} repos`,
		);
		const cursor = repositories[repositories.length - 1].cursor;
		const result = await fetchMigrationsRepoInOrg(
			opts.organization,
			opts.token,
			opts.allowUntrustedSslCertificates,
			`, after: "${cursor}"`,
		);
		spinner.succeed(
			`(${count}/${totalCount}) Fetched next ${opts.batchSize} repos`,
		);

		await delay(opts.waitTime);
		await fetchMigrationRepoMetrics(
			result.data.data.organization.repositoryMigrations.edges,
		);
	}
};

/**
 * Call CSV service to export migrations repositories status
 *
 * @param {String} organization the organization
 */
export const storeMigrationRepoMetrics = async (organization) => {
	const today = getDate();
	const suffix = `${today}-ghec`;
	const dir = `./${organization}-metrics`;

	if (!opts.outputFile && !fs.existsSync(dir)) {
		fs.mkdirSync(dir);
	}

	const headers = [
		'repo',
		'createdAt',
		'state',
		'failureReason',
		'warningsCount',
		'migrationLogUrl',
		'sourceUrl',
	];

	const path =
		(opts.outputFile && opts.outputFile.endsWith('.csv') && opts.outputFile) ||
		`${dir}/${organization}-migration-repo-${suffix}.csv`;
	const failedPath = path.split('.csv')[0] + '-failed.csv';
	const stringifier = getStringifier(path, headers);
	const failedStringifier = getStringifier(failedPath, headers);
	spinner.start('Exporting...');

	const metricsLength = metrics.length;
	for (let i = 0; i < metricsLength; i++) {
		const metric = metrics[i];
		stringifier.write(metric);

		if (metric.state === 'failed') {
			table.push([`${i + 1}.`, metric.repositoryName, metric.failureReason]);
			failedStringifier.write(metric);
		}
	}

	stringifier.end();
	failedStringifier.end();
	spinner.succeed(`Exporting Completed: ${path}`);

	return metrics;
};

/**
 * fetch options for fetchMigrationsRepoInOrg
 *
 * @param {string} org the organization
 * @param {string} token the token
 * @param {boolean} allowUntrustedSslCertificates the allow connections to a GitHub API endpoint that presents a SSL certificate that isn't issued by a trusted CA option
 * @param {string} cursor the last repository fetched
 * @returns {object} the fetch options
 */
export function fetchMigrationsRepoInOrgInfoOptions(
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
        organization(login: "${org}") {
          repositoryMigrations(first: ${Number(opts.batchSize)}${cursor}){
            totalCount
            edges {
              cursor
              node {
								repositoryName
								createdAt
								state
								failureReason
								warningsCount
								migrationLogUrl
								sourceUrl
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

export default exportGithubReposMigrationStatus;
