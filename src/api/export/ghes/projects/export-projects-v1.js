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
 * Valid V1 project options
 */
let opts = {};

/**
 * Initial fetched V1 projects in Organization
 */
let fetched = {};

/**
 * Count number of V1 projectS
 */
let count = 0;

/**
 * Total number of V1 projects
 */
let totalCount = 0;

export const fetchProjectsV1InOrg = async (
	org,
	token,
	serverUrl,
	allowUntrustedSslCertificates,
	cursor,
) => {
	const config = fetchProjectsV1Options(
		org,
		token,
		allowUntrustedSslCertificates,
		cursor,
	);
	config.url = determineGraphQLEndpoint(serverUrl);

	return doRequest(config);
};

const exportProjectsV1 = async (options) => {
	count = 0;
	opts = options;
	const response = await fetchProjectsV1InOrg(
		options.organization,
		options.token,
		options.serverUrl,
		options.allowUntrustedSslCertificates,
		'',
	);

	showGraphQLErrors(response);
	fetched = response.data;
	totalCount = fetched.data.organization.projects.totalCount;

	// Successful Authorization
	spinner.succeed('Authorized with GitHub\n');
	await fetchingController();
};

export const fetchingController = async () => {
	const nodes = fetched.data.organization.projects.nodes;
	const cursor = fetched.data.organization.projects.pageInfo.endCursor;
	await fetchProjectV1Metrics(nodes, cursor);

	if (metrics) {
		const org = opts.organization.replace(/\s/g, '');
		await storeProjectsV1Metrics(org);
	}
};

const convertProjectV1ToProjectV2 = (project) => {
	const convertedProject = {
		id: project.id,
		totalCount: project.totalCount,
		title: project.name,
		shortDescription: project.body,
		number: project.number,
		readme: null,
		fields: { nodes: [] },
		items: { nodes: [] },
		teams: { nodes: [] },
		repositories: { nodes: [] },
		workflows: { nodes: [] },
		views: { nodes: [] },
	};

	for (const column of project.columns.nodes) {
		const fieldValues = {
			nodes: [
				{
					name: column.name,
					__typename: 'ProjectV2ItemFieldSingleSelectValue',
					field: {
						name: 'Status'
					},
				},
			],
		};

		for (const card of column.cards.nodes) {
			const { state, note } = card;
			const content = {
				__typename: 'DraftIssue',
			};

			if (state === 'NOTE_ONLY') {
				content.title = note,
				content.body = note,
				content.assignees = {
					nodes: [],
				};
			} else {
				content.__typename = card.content.__typename;
				content.title = card.content.title;
				content.number = card.content.number;
			}

			convertedProject.items.nodes.push({ fieldValues, content });
		}
	}

	return convertedProject;
}

export const fetchNextColumnCards = async (projectId, columnId, endCursor) => {
	const config = {
		method: 'post',
		maxBodyLength: Infinity,
		headers: {
			Authorization: `bearer ${opts.token}`,
		},
		data: JSON.stringify({
			query: `{
				node(id: "${projectId}") {
					... on Project {
						column(id: "${columnId}") {
							cards(first: ${Number(opts.batchSize)}, after: "${endCursor}") {
								totalCount
								pageInfo {
									hasNextPage
									endCursor
								}
								nodes {
									id
									note
									isArchived
									state
									content {
										... on Issue {
											id
											title
											__typename
										}
										... on PullRequest {
											id
											title
											__typename
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
	if (opts.allowUntrustedSslCertificates) {
		config.httpsAgent = new https.Agent({ rejectUnauthorized: false });
	}
	config.url = determineGraphQLEndpoint(opts.serverUrl);
	const result = await doRequest(config);
	showGraphQLErrors(result);
	return result;
}

const getNextColumnCards = async (columns, projectId) => {
	let cardsCount = opts.batchSize;
	const nextColumnCards = [];
	for (const column of columns) {
		const { hasNextPage, endCursor } = column.cards.pageInfo;
		if (hasNextPage) {
			spinner.start(
				`(${cardsCount}/${column.cards.totalCount}) Fetching next ${opts.batchSize} cards`,
			);
			const result = await fetchNextColumnCards(
				projectId,
				column.id,
				endCursor,
			);
			spinner.succeed(
				`(${cardsCount}/${column.cards.totalCount}) Fetched next ${opts.batchSize} cards`,
			);
			await delay(opts.waitTime);
			cardsCount += Number(opts.batchSize);
			nextColumnCards.push(...result.data.data.node.cards.nodes);
		}
	}
	return nextColumnCards;
}

export const fetchProjectV1Metrics = async (projectsV1, cursor) => {
	for (const project of projectsV1) {
		spinner.start(
			`(${count}/${fetched.data.organization.projects.totalCount}) Fetching projects V1`,
		);
		count = count + 1;
		const nextColumnCards = await getNextColumnCards(project.columns.nodes, project.id);
		project.columns.nodes.concat(nextColumnCards);
		const convertedProject = convertProjectV1ToProjectV2(project);
		metrics.push(convertedProject);
		spinner.succeed(
			`(${count}/${fetched.data.organization.projects.totalCount}) Fetching projects V1`,
		);
	}

	// paginating calls
	// fetch the next 2 projects
	if (metrics.length !== totalCount) {
		spinner.start(
			`(${count}/${totalCount}) Fetching next 2 projects V1`,
		);
		const result = await fetchProjectsV1InOrg(
			opts.organization,
			opts.token,
			opts.serverUrl,
			opts.allowUntrustedSslCertificates,
			`, after: "${cursor}"`,
		);

		spinner.succeed(
			`(${count}/${totalCount}) Fetched next 2 projects V1`,
		);

		await delay(opts.waitTime);
		const nodes = result.data.data.organization.projects.nodes;
		const endCursor = result.data.data.organization.projects.pageInfo.endCursor;
		await fetchProjectV1Metrics(nodes, endCursor);
	}
};

export const storeProjectsV1Metrics = async (organization) => {
	const dir = `./${organization}-metrics`;

	if (!opts.outputFile && !fs.existsSync(dir)) {
		fs.mkdirSync(dir);
	}

	const suffix = opts.serverUrl ? `ghes-${currentTime()}` : `ghec-${currentTime()}`;

	const path = `${dir}/${organization}-projects-v1-${suffix}.json`;

	spinner.start('Exporting Projects V1...');

	fs.writeFileSync(path, JSON.stringify(metrics, null, 2), 'utf8');

	spinner.succeed(`Exporting Projects V1 Completed: ${path}`);
};

export function determineGraphQLEndpoint(url) {
	if (!url) {
		return GITHUB_GRAPHQL_API_URL;
	} else {
		return url + '/api/graphql';
	}
}

export function fetchProjectsV1Options(
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
					projects(first: 2${cursor}) {
						totalCount
						pageInfo {
							hasNextPage
							endCursor
						}
						nodes {
							name
							body
							closed
							number
							columns(first: 15) {
								totalCount
								nodes {
									id
									name
									purpose
									cards(first: ${Number(opts.batchSize)}) {
										totalCount
										pageInfo {
											hasNextPage
											endCursor
										}
										nodes {
											id
											note
											isArchived
											state
											content {
												... on Issue {
													id
													title
													__typename
												}
												... on PullRequest {
													id
													title
													__typename
												}
											}
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

export default exportProjectsV1;
