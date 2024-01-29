#!/usr/bin/env node

import Ora from 'ora';
import progressBar from 'progress-bar-cli';
import Table from 'cli-table';
import fs from 'fs';
import {
	delay,
	getDate,
	getData,
	getStringifier,
	doRequest,
	showGraphQLErrors,
} from '../../../../services/utils.js';
import * as speak from '../../../../services/style-utils.js';
import { tableChars } from '../../../../services/style-utils.js';
import { GITHUB_GRAPHQL_API_URL, PROGRESS_BAR_CLEAR_NUM } from '../../../../services/constants.js';
import https from 'https';

const spinner = Ora();

const metrics = [];

/**
 * Valid user options
 */
let opts = {};

/**
 * Initial fetched users in Organization
 */
let fetched = {};

/**
 * Count number of users
 */
let count = 0;

let totalCount = 0;

let table;

const tableHead = ['Organization', 'No. of users'].map((h) =>
	speak.successColor(h),
);
export const fetchUsersInOrg = async (
	org,
	token,
	serverUrl,
	allowUntrustedSslCertificates,
	cursor,
) => {
	const config = fetchUsersInOrgInfoOptions(
		org,
		token,
		allowUntrustedSslCertificates,
		cursor,
	);
	config.url = determineGraphQLEndpoint(serverUrl);

	return doRequest(config);
};

const exportGithubOrgUsers = async (options) => {
	count = 0;
	opts = options;
	table = new Table({
		chars: tableChars,
		head: tableHead,
	});
	const response = await fetchUsersInOrg(
		options.organization,
		options.token,
		options.serverUrl,
		options.allowUntrustedSslCertificates,
		'',
	);

	showGraphQLErrors(response);
	fetched = response.data;
	totalCount = fetched.data.organization.membersWithRole.totalCount;

	if (totalCount === 0) {
		speak.warn(`No users in organization ${options.organization}`);
		return;
	}

	// Successful Authorization
	spinner.succeed('Authorized with GitHub\n');
	await fetchingController();

	if (options.return) return metrics;
};

export const fetchingController = async () => {
	await fetchUsersMetrics(fetched.data.organization.membersWithRole.edges);
	const org = opts.organization.replace(/\s/g, '');

	if (!opts.return) {
		await storeUsersMetrics(org);
		table.push([org, metrics.length]);
		console.log('\n' + table.toString());
	}
};

export const fetchUsersMetrics = async (users) => {
	for (const user of users) {
		spinner.start(
			`(${count}/${totalCount}) Fetching metrics for user ${user.node.login}`,
		);

		const userInfo = {
			login: user.node.login.toLowerCase(),
			name: user.node.name,
			email: user.node.email,
			role: user.role,
			hasTwoFactorEnabled: user.hasTwoFactorEnabled,
			avatarUrl: user.node.avatarUrl,
			id: user.node.databaseId,
			url: user.node.url,
			websiteUrl: user.node.websiteUrl,
			isSiteAdmin: user.node.isSiteAdmin,
			isViewer: user.node.isViewer,
			projectsUrl: user.node.projectsUrl,
			projectsResourcePath: user.node.projectsResourcePath,
			createdAt: user.node.createdAt,
			updatedAt: user.node.updatedAt,
		};

		count = count + 1;
		metrics.push(userInfo);
		spinner.succeed(
			`(${count}/${totalCount}) Fetching metrics for user ${user.node.login}`,
		);
	}

	if (!opts.return) progressBar.progressBar(count - 1, totalCount, new Date(), PROGRESS_BAR_CLEAR_NUM);

	// paginating calls
	// if there are more than batchSize users
	// fetch the next batchSize users
	if (users.length == opts.batchSize) {
		// get cursor to last user
		spinner.start(
			`(${count}/${totalCount}) Fetching next ${opts.batchSize} users`,
		);
		const cursor = users[users.length - 1].cursor;
		const result = await fetchUsersInOrg(
			opts.organization,
			opts.token,
			opts.serverUrl,
			opts.allowUntrustedSslCertificates,
			`, after: "${cursor}"`,
		);

		spinner.succeed(
			`(${count}/${totalCount}) Fetched next ${opts.batchSize} users`,
		);

		await delay(opts.waitTime);
		await fetchUsersMetrics(
			result.data.data.organization.membersWithRole.edges,
		);
	}
};

export const storeUsersMetrics = async (organization) => {
	const dir = `./${organization}-metrics`;

	if (!opts.outputFile && !fs.existsSync(dir)) {
		fs.mkdirSync(dir);
	}

	const today = getDate();
	const suffix = opts.serverUrl ? `${today}-ghes` : `${today}-ghec`;
	const path =
		(opts.outputFile && opts.outputFile.endsWith('.csv') && opts.outputFile) ||
		`${dir}/${organization}-user-metrics-${suffix}.csv`;

	const stringifier = getStringifier(path);
	spinner.start('Exporting...');

	let enterpriseUsers = [];

	if (opts.usersFile) {
		const usersData = await getData(opts.usersFile);
		enterpriseUsers = usersData.map((row) => row.login.toLowerCase());
	}

	for (const metric of metrics) {
		if (enterpriseUsers.length > 0 && !enterpriseUsers.includes(metric.login))
			continue;

		stringifier.write(metric);
	}

	stringifier.end();
	spinner.succeed(`Exporting Completed: ${path}`);
};

export function determineGraphQLEndpoint(url) {
	if (!url) {
		return GITHUB_GRAPHQL_API_URL;
	} else {
		return url + '/api/graphql';
	}
}

export function fetchUsersInOrgInfoOptions(
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
          membersWithRole(first: ${Number(opts.batchSize)}${cursor}) {
            totalCount
            edges {
              cursor
              hasTwoFactorEnabled
              role
              node {
                avatarUrl
                createdAt
                databaseId
                email
                isSiteAdmin
                isViewer
                login
                name
                projectsResourcePath
                projectsUrl
                updatedAt
                url
                websiteUrl
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

export default exportGithubOrgUsers;
