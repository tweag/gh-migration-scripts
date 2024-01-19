import fs from 'fs';
import progress from 'cli-progress';
import { doRequest } from '../../../../services/utils.js';
import { GITHUB_GRAPHQL_API_URL } from '../../../../services/constants.js';

let org;
let token;
let projectId;

const getGraphQLConfig = (query) => {
	return {
		method: 'post',
		maxBodyLength: Infinity,
		headers: {
			Authorization: `Bearer ${token}`,
		},
		data: JSON.stringify({ query }),
		url: GITHUB_GRAPHQL_API_URL,
	};
};

const getOwnerId = async () => {
	const query = `query {
    organization(login: "${org}") {
      id
    }
  }`;
	const config = getGraphQLConfig(query);
	const response = await doRequest(config);
	return response.data.data.organization.id;
};

const createProjectV2 = async (ownerId, title) => {
	const query = `mutation {
    createProjectV2(
      input: {
        ownerId: "${ownerId}",
        title: "${title}",
      }
    ) {
      projectV2 {
        id
        fields(first: 6) {
          nodes {
            ... on ProjectV2Field {
              id
              __typename
              name
              dataType
            }
            ... on ProjectV2SingleSelectField {
              id
              __typename
              name
              dataType
              options {
                id
                color
                description
                descriptionHTML
                name
                nameHTML
              }
            }
          }
        }
      }
     }
  }`;
	const config = getGraphQLConfig(query, token);
	const response = await doRequest(config);
	return {
		id: response.data.data.createProjectV2.projectV2.id,
		fields: response.data.data.createProjectV2.projectV2.fields.nodes,
	};
};

const updateProjectV2 = async ({ isPublic, readme, shortDescription }) => {
	const query = `mutation {
    updateProjectV2(
      input: {
        projectId: "${projectId}",
        public: ${isPublic},
        readme: "${readme}",
        shortDescription: "${shortDescription}",
      }
    ) {
      projectV2 {
        id
      }
     }
  }`;
	const config = getGraphQLConfig(query, token);
	const response = await doRequest(config);
	return response.data.data.updateProjectV2.projectV2.id;
};

const getStatuses = (fields) => {
	const statusField = fields.find((field) => field.name === 'Status');
	return statusField.options.map((option) => option.name);
};

const statusMapFunction = (status) => status.toLowerCase().replace(/\s+/, '');

const logMissingStatuses = (title, sourceStatuses, targetStatuses) => {
	const missingStatuses = [];
	const mappedTargetStatuses = targetStatuses.map(statusMapFunction);

	for (const status of sourceStatuses) {
		const mappedStatus = statusMapFunction(status);
		if (!mappedTargetStatuses.includes(mappedStatus)) {
			missingStatuses.push(status);
		}
	}

	showMissingStatuses(title, missingStatuses);
};

const showMissingStatuses = (title, missingStatuses) => {
	console.log(
		`For project v2 ${title} following statuses need to be added in the target first.`,
	);
	for (let i = 0; i < missingStatuses.length; i++) {
		console.log(i + 1, ' ' + missingStatuses[i]);
	}
};

const addProjects = async (projects, ownerId, skip) => {
	projects = projects.slice(skip);
	const progressBar = new progress.SingleBar(
		{},
		progress.Presets.shades_classic,
	);
	progressBar.start(projects.length, 0);

	for (const project of projects) {
		const {
			title,
			public: isPublic,
			readme,
			shortDescription,
			fields: sourceFields,
		} = project;

		const projectExistsArr = await checkIfProjectExists(title);
		const sourceStatuses = getStatuses(sourceFields.nodes);

		if (projectExistsArr.length > 0) {
			const targetStatuses = getStatuses(projectExistsArr[0].fields.nodes);
			logMissingStatuses(title, sourceStatuses, targetStatuses);
			console.log(`Project already exists for  ${title}`);
			continue;
		}

		const { id, fields } = await createProjectV2(ownerId, title);
		const targetStatuses = getStatuses(fields);
		logMissingStatuses(title, sourceStatuses, targetStatuses);
		projectId = id;
		const responseId = await updateProjectV2({
			token,
			isPublic,
			readme,
			shortDescription,
		});

		if (responseId) console.log('Successfully updated project: ', title);
		progressBar.increment();
	}

	progressBar.stop();
};

const checkIfProjectExists = async (title) => {
	const query = `
		query {
			organization(login: "${org}") {
				projectsV2(first: 1, query: "${title}") {
					nodes {
						fields(first: 20) {
							nodes {
								... on ProjectV2SingleSelectField {
									id
									name
									options {
										name
									}
								}
							}
						}
					}
				}
			}
		}
	`;

	const config = getGraphQLConfig(query);
	const response = await doRequest(config);
	return response.data.data.organization.projectsV2.nodes;
};

const importGithubProjectsV2 = async (options) => {
	try {
		const { organization, inputFile, token: pat, skip } = options;
		org = organization;
		token = pat;
		const projects = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
		const ownerId = await getOwnerId();

		await addProjects(projects, ownerId, Number(skip));
	} catch (err) {
		console.log(err);
	}
};

export default importGithubProjectsV2;
