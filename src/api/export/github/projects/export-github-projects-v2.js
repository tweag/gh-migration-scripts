#!/usr/bin/env node

import Ora from 'ora';
import { progressBar } from 'progress-bar-cli';
import Table from 'cli-table';
import fs from 'fs';
import {
	delay,
	doRequest,
	showGraphQLErrors,
	currentTime,
} from '../../../../services/utils.js';
import { GITHUB_GRAPHQL_API_URL, PROGRESS_BAR_CLEAR_NUM } from '../../../../services/constants.js';
import * as speak from '../../../../services/style-utils.js';
import { tableChars } from '../../../../services/style-utils.js';
import https from 'https';

const spinner = Ora();

const metrics = [];

/**
 * Valid V2 project options
 */
let opts = {};

/**
 * Initial fetched V2 projects in Organization
 */
let fetched = {};

/**
 * Count number of V2 projectS
 */
let count = 0;

/**
 * Total number of V2 projects
 */
let totalCount = 0;

let table;

const tableHead = ['No.', 'Project V2 Title'].map((h) => speak.successColor(h));

export const fetchProjectsV2InOrg = async (
	org,
	token,
	serverUrl,
	allowUntrustedSslCertificates,
	cursor,
) => {
	const config = fetchProjectsV2Options(
		org,
		token,
		allowUntrustedSslCertificates,
		cursor,
	);
	config.url = determineGraphQLEndpoint(serverUrl);

	return doRequest(config);
};

const exportGithubProjectsV2 = async (options) => {
	table = new Table({
		chars: tableChars,
		head: tableHead,
	});
	count = 0;
	opts = options;
	const response = await fetchProjectsV2InOrg(
		options.organization,
		options.token,
		options.serverUrl,
		options.allowUntrustedSslCertificates,
		'',
	);

	showGraphQLErrors(response);
	fetched = response.data;
	totalCount = fetched.data.organization.projectsV2.totalCount;

	if (totalCount === 0) {
		speak.warn(`No projects V2 found for organization ${options.organization}`);
		return;
	}

	// Successful Authorization
	spinner.succeed('Authorized with GitHub\n');
	await fetchingController();
};

export const fetchingController = async () => {
	const nodes = fetched.data.organization.projectsV2.nodes;
	const cursor = fetched.data.organization.projectsV2.pageInfo.endCursor;
	await fetchProjectV2Metrics(nodes, cursor);

	if (metrics) {
		const org = opts.organization.replace(/\s/g, '');
		await storeProjectsV2Metrics(org);
	}

	for (let i = 0; i < metrics.length; i++) {
		table.push([i + 1, metrics[i].title]);
	}

	console.log('\n' + table.toString());
};

const projectV2ItemsGql = () => {
	return `
		totalCount
		pageInfo {
			hasNextPage
			endCursor
		}
		nodes {
			fieldValues(first: 20) {
				nodes {
					... on ProjectV2ItemFieldSingleSelectValue {
						id
						name
						nameHTML
						optionId
						color
						__typename
						field {
							... on ProjectV2FieldCommon {
								id
								name
							}
						}
					}
					... on ProjectV2ItemFieldDateValue {
						id
						__typename
						date
						field {
							... on ProjectV2FieldCommon {
								id
								name
							}
						}
					}
					... on ProjectV2ItemFieldTextValue {
						id
						text
						__typename
						field {
							... on ProjectV2FieldCommon {
								id
								name
							}
						}
					}
					... on ProjectV2ItemFieldUserValue {
						users(first: 10) {
							nodes {
								login
							}
						}
						__typename
						field {
							... on ProjectV2FieldCommon {
								id
								name
							}
						}
					}
					... on ProjectV2ItemFieldLabelValue {
						labels(first: 20) {
							nodes {
								name
								color
								description
								isDefault
							}
						}
						__typename
						field {
							... on ProjectV2FieldCommon {
								id
								name
							}
						}
					}
					... on ProjectV2ItemFieldNumberValue {
						id
						number
						__typename
						field {
							... on ProjectV2FieldCommon {
								id
								name
							}
						}
					}
					... on ProjectV2ItemFieldValueCommon {
						id
						__typename
						field {
							... on ProjectV2FieldCommon {
								id
								name
							}
						}
					}
					... on ProjectV2ItemFieldIterationValue {
						id
						duration
						title
						titleHTML
						startDate
						__typename
						field {
							... on ProjectV2FieldCommon {
								id
								name
							}
						}
					}
					... on ProjectV2ItemFieldMilestoneValue {
						milestone {
							id
							dueOn
							state
							closed
							viewerCanReopen
							viewerCanClose
						}
						__typename
						field {
							... on ProjectV2FieldCommon {
								id
								name
							}
						}
					}
					... on ProjectV2ItemFieldRepositoryValue {
						repository {
							name
							id
						}
						__typename
						field {
							... on ProjectV2FieldCommon {
								id
								name
							}
						}
					}
					... on ProjectV2ItemFieldPullRequestValue {
						pullRequests(first: 10) {
							nodes {
								id
								number
								title
								repository {
									name
									id
								}
							}
						}
						__typename
						field {
							... on ProjectV2FieldCommon {
								id
								name
							}
						}
					}
				}
			}
			content {
				... on DraftIssue {
					assignees(first: 10) {
						nodes {
							name
						}
					}
					id
					__typename
					body
					bodyHTML
					bodyText
				}
				... on PullRequest {
					id
					__typename
					number
					title
					repository {
						name
					}
				}
				... on Issue {
					number
					id
					__typename
					number
					title
					repository {
						name
					}
				}
			}
		}
	`;
};

const fetchNextItems = async (cursor, id) => {
	const config = {
		method: 'post',
		maxBodyLength: Infinity,
		headers: {
			Authorization: `bearer ${opts.token}`,
		},
		data: JSON.stringify({
			query: `{
				node(id: "${id}") {
					... on ProjectV2 {
						items(first: ${Number(opts.batchSize)}, after: "${cursor}") {
							${projectV2ItemsGql()}
						}
					}
				}
			}`,
		}),
	};

	config.url = determineGraphQLEndpoint(opts.serverUrl);

	const response = await doRequest(config);

	showGraphQLErrors(response);

	return {
		items: response.data.data.node.items.nodes,
		nextItemsPageInfo: response.data.data.node.items.pageInfo,
	};
};

export const fetchProjectV2Metrics = async (projectsV2, cursor) => {
	for (const projectV2 of projectsV2) {
		let hasNextItems = projectV2.items.pageInfo.hasNextPage;
		let endCursor = cursor;

		while (hasNextItems) {
			const { items, nextItemsPageInfo } = await fetchNextItems(
				endCursor,
				projectV2.id,
			);
			projectV2.items.nodes = [...projectV2.items.nodes, ...items];
			hasNextItems = nextItemsPageInfo.hasNextPage;
			endCursor = nextItemsPageInfo.endCursor;
		}

		spinner.start(
			`(${count}/${fetched.data.organization.projectsV2.totalCount}) Fetching projects v2`,
		);
		count = count + 1;
		metrics.push(projectV2);
		spinner.succeed(
			`(${count}/${fetched.data.organization.projectsV2.totalCount}) Fetching projects v2`,
		);
	}

	progressBar(count - 1, totalCount, new Date(), PROGRESS_BAR_CLEAR_NUM);

	// paginating calls
	// fetch the next 2 projects V2
	if (metrics.length !== totalCount) {
		spinner.start(`(${count}/${totalCount}) Fetching next 2 projects V2`);
		const result = await fetchProjectsV2InOrg(
			opts.organization,
			opts.token,
			opts.serverUrl,
			opts.allowUntrustedSslCertificates,
			`, after: "${cursor}"`,
		);

		spinner.succeed(`(${count}/${totalCount}) Fetched next 2 projects V2`);

		await delay(opts.waitTime);
		const nodes = result.data.data.organization.projectsV2.nodes;
		const endCursor =
			result.data.data.organization.projectsV2.pageInfo.endCursor;
		await fetchProjectV2Metrics(nodes, endCursor);
	}
};

export const storeProjectsV2Metrics = async (organization) => {
	const dir = `./${organization}-metrics`;

	if (!opts.outputFile && !fs.existsSync(dir)) {
		fs.mkdirSync(dir);
	}

	const suffix = opts.serverUrl
		? `ghes-${currentTime()}`
		: `ghec-${currentTime()}`;

	const path = `${dir}/${organization}-projects-v2-${suffix}.json`;

	spinner.start('Exporting Projects V2...');

	fs.writeFileSync(path, JSON.stringify(metrics, null, 2), 'utf8');

	spinner.succeed(`Exporting Projects V2 Completed: ${path}`);
};

export function determineGraphQLEndpoint(url) {
	if (!url) {
		return GITHUB_GRAPHQL_API_URL;
	} else {
		return url + '/api/graphql';
	}
}

export function fetchProjectsV2Options(
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
					projectsV2(first: 2${cursor}) {
						totalCount
						pageInfo {
							hasNextPage
							endCursor
						}
						nodes {
							id
							number
							readme
							title
							public
							databaseId
							shortDescription
							fields(first: 20) {
								nodes {
									... on ProjectV2Field {
										id
										__typename
										name
										dataType
									}
									... on ProjectV2IterationField {
										id
										__typename
										name
										dataType
										configuration {
											duration
											startDay
											iterations {
												id
												duration
												startDate
											}
											completedIterations {
												id
												duration
												startDate
											}
										}
									}
									... on ProjectV2SingleSelectField {
										id
										__typename
										name
										dataType
										options {
											color
											description
											name
										}
									}
								}
							}
							items(first: ${Number(opts.batchSize)}) {
								${projectV2ItemsGql()}
							}
							teams(first: 10) {
								pageInfo {
									hasNextPage
									endCursor
								}
								nodes {
									name
								}
							}
							repositories(first: 10) {
								pageInfo {
									hasNextPage
									endCursor
								}
								nodes {
									name
								}
							}
							workflows(first: 10) {
								pageInfo {
									hasNextPage
									endCursor
								}
								nodes {
									name
									number
									id
									enabled
								}
							}
							views(first: 10) {
								pageInfo {
									hasNextPage
									endCursor
								}
								nodes {
									id
									name
									number
									layout
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

export default exportGithubProjectsV2;
