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

export const fetchProjectInOrg = async (
	org,
	token,
	serverUrl,
	allowUntrustedSslCertificates,
	cursor,
) => {
	const config = fetchProjectInOrgInfoOptions(
		org,
		token,
		allowUntrustedSslCertificates,
		cursor,
	);
	config.url = determineGraphQLEndpoint(serverUrl);

	return doRequest(config);
};

export const fetchProjects = async (
	org,
	project,
	token,
	serverUrl,
	allowUntrustedSslCertificates,
	cursor,
) => {
	const config = fetchProjectsOptions(
		org,
		project,
		token,
		allowUntrustedSslCertificates,
		cursor,
	);
	config.url = determineGraphQLEndpoint(serverUrl);

	return doRequest(config);
};

export const getProjects = async (options) => {
	count = 0;
	opts = options;
	const response = await fetchProjectInOrg(
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
	await fetchProjectMetrics(fetched.data.organization.projects.edges);

	if (metrics) {
		const org = opts.organization.replace(/\s/g, '');
		await storeProjectsMetrics(org);
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

export const fetchProjectMetrics = async (projects) => {
	for (const project of projects) {
		spinner.start(
			`(${count}/${fetched.data.organization.projects.totalCount}) Fetching metrics for project ${project.node.name}`,
		);

		const projectInfo = {
			name: project.node.name,
			combinedSlug: project.node.combinedSlug,
			createdAt: project.node.createdAt,
			id: project.node.databaseId,
			description: project.node.description,
			privacy: project.node.privacy,
			repositoriesResourcePath: project.node.repositoriesResourcePath,
			slug: project.node.slug,
			resourcePath: project.node.resourcePath,
			updatedAt: project.node.updatedAt,
			url: project.node.url,
			parentproject: project.node.parentproject ? project.node.parentproject.slug : null,
			parentprojectId: project.node.parentproject
				? project.node.parentproject.databaseId
				: null,
			repositoriesUrl: project.node.repositoriesUrl,
			childprojects: project.node.childprojects.totalCount,
			repositories: processRepos(repositories),
			repositoriesCount: project.node.repositories.totalCount,
			members: processMembers(members),
			membersCount: project.node.members.totalCount,
		};

		count = count + 1;
		metrics.push(projectInfo);
		spinner.succeed(
			`(${count}/${fetched.data.organization.projects.totalCount}) Fetching metrics for project ${project.node.name}`,
		);
	}

	// paginating calls
	// if there are more than batchSize projects
	// fetch the next batchSize projects
	if (projects.length == opts.batchSize) {
		// get cursor to last project
		spinner.start(
			`(${count}/${fetched.data.organization.projects.totalCount}) Fetching next ${opts.batchSize} projects`,
		);
		const cursor = projects[projects.length - 1].cursor;
		const result = await fetchProjectInOrg(
			opts.organization,
			opts.token,
			opts.serverUrl,
			opts.allowUntrustedSslCertificates,
			`, after: "${cursor}"`,
		);

		spinner.succeed(
			`(${count}/${fetched.data.organization.projects.totalCount}) Fetched next ${opts.batchSize} projects`,
		);

		await delay(opts.waitTime);
		await fetchProjectMetrics(result.data.data.organization.projects.edges);
	}
};

export const storeProjectsMetrics = async (organization) => {
	const dir = `./${organization}-metrics`;

	if (!opts.outputFile && !fs.existsSync(dir)) {
		fs.mkdirSync(dir);
	}

	const today = getDate();
	const suffix = opts.serverUrl ? `${today}-ghes` : `${today}-ghec`;

	const path = `${dir}/${organization}-projects-${suffix}.csv`;

	const stringifier = getStringifier(path);
	spinner.start('Exporting...');

	for (const metric of metrics) {
		stringifier.write(metric);
	}

	spinner.succeed(`Exporting Completed: ${path}`);
};

export function determineGraphQLEndpoint(url) {
	if (!url) {
		return GITHUB_GRAPHQL_API_URL;
	} else {
		return url + '/api/graphql';
	}
}

export function fetchProjectsOptions(
	projectId,
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
        node(id: "${projectId}") {
          ... on ProjectV2 {
            items(first: ${Number(opts.batchSize)}${cursor}) {
              nodes {
                id
                fieldValues(first: ${Number(opts.batchSize)}${cursor}) {
                  nodes {
                    ... on ProjectV2ItemFieldTextValue {
                      __typename
                      text
                      field {
                        ... on ProjectV2FieldCommon {
                          name
                        }
                      }
                    }
                    ... on ProjectV2ItemFieldDateValue {
                      __typename
                      date
                      field {
                        ... on ProjectV2FieldCommon {
                          name
                        }
                      }
                    }
                    ... on ProjectV2ItemFieldSingleSelectValue {
                      __typename
                      name
                      field {
                        ... on ProjectV2FieldCommon {
                          name
                        }
                      }
                    }
                  }
                }
                content {
                  ... on DraftIssue {
                    __typename
                    title
                    body
                    assignees(first: 10) {
                      nodes {
                        login
                      }
                    }
                  }
                  ... on Issue {
                    __typename
                    title
                    body
                    assignees(first: 10) {
                      nodes {
                        login
                      }
                    }
                  }
                  ... on PullRequest {
                    __typename
                    title
                    body
                    assignees(first: 10) {
                      nodes {
                        login
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
