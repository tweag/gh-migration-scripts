#!/usr/bin/env node

import Ora from 'ora';
import fs from 'fs';
import {
	delay,
	doRequest,
	showGraphQLErrors,
	currentTime,
} from '../../../../services/utils.js';
import { GITHUB_GRAPHQL_API_URL } from '../../../../services/constants.js';
import https from 'https';

const spinner = Ora();

const metrics = [];

/**
 * Valid project options
 */
let opts = {};

/**
 * Initial fetched projects in Organization
 */
let fetched = {};

/**
 * Count number of project
 */
let count = 0;

/**
 * Total number of projects
 */
let totalCount = 0;

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

const exportProjectsV2 = async (options) => {
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

	// Successful Authorization
	spinner.succeed('Authorized with GitHub\n');
	await fetchingController();
};

export const fetchingController = async () => {
	const nodes = fetched.data.organization.projectsV2.nodes;
	const cursor = fetched.data.organization.projectsV2.pageInfo.endCursor;
	await fetchProjectMetrics(nodes, cursor);

	if (metrics) {
		const org = opts.organization.replace(/\s/g, '');
		await storeProjectsMetrics(org);
	}
};

const itemsGql = () => {
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
					resourcePath
					body
					bodyHTML
					bodyText
					assignees {
						nodes {
							name
							id
						}
					}
					repository {
						name
					}
				}
				... on Issue {
					number
					id
					__typename
					title
					body
					bodyUrl
					bodyHTML
					bodyText
					bodyResourcePath
					databaseId
					assignees {
						nodes {
							name
							id
						}
					}
					repository {
						name
					}
				}
			}
		}
	`
}

export const fetchProjectMetrics = async (projects, cursor) => {
	for (const project of projects) {
		spinner.start(
			`(${count}/${fetched.data.organization.projectsV2.totalCount}) Fetching projects v2`,
		);
		count = count + 1;
		metrics.push(project);
		spinner.succeed(
			`(${count}/${fetched.data.organization.projectsV2.totalCount}) Fetching projects v2`,
		);
	}

	// paginating calls
	// fetch the next 2 projects
	if (metrics.length !== totalCount) {
		spinner.start(
			`(${count}/${totalCount}) Fetching next 2 projects`,
		);
		const result = await fetchProjectsV2InOrg(
			opts.organization,
			opts.token,
			opts.serverUrl,
			opts.allowUntrustedSslCertificates,
			`, after: "${cursor}"`,
		);

		spinner.succeed(
			`(${count}/${totalCount}) Fetched next 2 projects`,
		);

		await delay(opts.waitTime);
		const nodes = result.data.data.organization.projectsV2.nodes;
		const endCursor = result.data.data.organization.projectsV2.pageInfo.endCursor;
		await fetchProjectMetrics(nodes, endCursor);
	}
};

export const storeProjectsMetrics = async (organization) => {
	const dir = `./${organization}-metrics`;

	if (!opts.outputFile && !fs.existsSync(dir)) {
		fs.mkdirSync(dir);
	}

	const suffix = opts.serverUrl ? `ghes-${currentTime()}` : `ghec-${currentTime()}`;

	const path = `${dir}/${organization}-projects-${suffix}.json`;

	spinner.start('Exporting...');

	fs.writeFileSync(path, JSON.stringify(metrics, null, 2), 'utf8');

	spinner.succeed(`Exporting Completed: ${path}`);
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
					projectsV2(first: 5${cursor}) {
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
								${itemsGql()}
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

export default exportProjectsV2;
