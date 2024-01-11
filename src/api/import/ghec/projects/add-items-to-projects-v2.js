import fs from 'fs';
import { doRequest } from '../../../../services/utils.js';

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
		data: JSON.stringify(query),
	};
};

const getOwnerId = async (organization) => {
	const query = `query {
    organization(login: "${organization}") {
      id
    }
  }`;
	const config = getGraphQLConfig(query, token);
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
		id: response.data.createProjectV2.projectV2.id,
		fields: response.data.createProjectV2.projectV2.fields.nodes,
	};
};

const updateProjectV2 = async ({ isPublic, readme, shortDescription }) => {
	const query = `mutation {
    updateProjectV2(
      input: {
        projectId: "${projectId}",
        public: "${isPublic}",
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
	return response.data.organization.projectV2.id;
};

const addField = async (name, dataType, options) => {
	let query = `mutation {
    createProjectV2Field(
      input: {
        projectId: "${projectId}",
        name: "${name}",
        dataType: ${dataType},
      }
    ) {
      projectV2Field {
        id
      }
     }
  }`;

	if (options) {
		query = `mutation {
      createProjectV2Field(
        input: {
          projectId: "${projectId}",
          name: "${name}",
          dataType: ${dataType},
          options: "${options}",
        }
      ) {
        projectV2Field {
          id
        }
       }
    }`;
	}
	const config = getGraphQLConfig(query);
	const response = await doRequest(config);
	return response.data.addProjectV2Field.projectV2Field.id;
};

const addCustomFields = async (sourceFields, fields) => {
	const fieldMap = new Map();

	for (const sourceField of sourceFields) {
		const { name, dataType, __typename } = sourceField;
		const field = fields.find(
			(field) =>
				field.name === name &&
				field.dataType === dataType &&
				field.__typename === __typename,
		);

		if (field) {
			fieldMap.set(name, field.id);
		} else {
			let options;
			if (dataType === 'SINGLE_SELECT') {
				options = field.options;
			}
			const fieldId = await addField(name, dataType, options);
			fieldMap.set(name, fieldId);
		}
	}
};

const getIssueOrPullRequestId = async (repo, number) => {
	const query = `
    query {
      organization(login: "${org}") {
        repository(name: "${repo}") {
          issueOrPullRequest(number: ${number}) {
            ... on Issue {
              id
            }
            ... on PullRequest {
              id
            }
          }
        }
      }
    }
  `;

	const config = getGraphQLConfig(query);
	const response = await doRequest(config);
	return response.data.organization.repository.issueOrPullRequest.id;
};

const addDraftIssue = async (title, body) => {
	const query = `
    mutation {
      addProjectV2DraftIssue(input: {
        projectId: "${projectId}",
        title: "${title}",
        body: "${body}",
      }) {
        projectItem {
          id
        }
      })
    }
  `;
	const config = getGraphQLConfig(query);
	const response = await doRequest(config);
	return response.data.addProjectV2DraftIssue.projectItem.id;
};

const addIssueOrPullRequestItem = async (itemId) => {
	const query = `
    mutation {
      addProjectV2ItemById(input: {
        projectId: "${projectId}",
        contentId: "${itemId}",
      }) {
        item {
          id
        }
      })
    }
  `;
	const config = getGraphQLConfig(query);
	const response = await doRequest(config);
	return response.data.addProjectV2ItemById.item.id;
};

const addItemsToProjectV2 = async (items) => {
	try {
		for (const item of items) {
			const { content } = item;
			const { __typename, title } = content;

			// TODO: add assignees
			if (__typename === 'DraftIssue') {
				const { body } = content;
				const response = await addDraftIssue(title, body);

				if (response) {
					console.log(`Successfully added draft issue with title ${title}`);
				} else {
					throw new Error(`Failed to add draft issue with title ${title}`);
				}
			} else {
				const { number, repository } = content;
				const itemId = await getIssueOrPullRequestId(repository.name, number);
				const response = await addIssueOrPullRequestItem(itemId);

				if (response) {
					console.log(`Successfully added item with title ${title}`);
				} else {
					throw new Error(`Failed to add item with title ${title}`);
				}
			}
		}

		return true;
	} catch (e) {
		console.log(e);
		return false;
	}
};

const addProjects = async (projects, ownerId) => {
	for (const project of projects) {
		const {
			title,
			public: isPublic,
			readme,
			shortDescription,
			fields: sourceFields,
			items,
		} = project;
		const { id, fields } = await createProjectV2(ownerId, title);
		projectId = id;
		const responseId = await updateProjectV2({
			token,
			isPublic,
			readme,
			shortDescription,
		});

		if (responseId) console.log('Successfully updated project: ', title);

		const addFieldsResponse = await addCustomFields(sourceFields, fields);

		if (addFieldsResponse) {
			console.log('Successfully added fields to project: ', title);
		} else {
			throw new Error("Couldn't add fields to project: ", title);
		}
		// const fieldDetails = await getFields(organization);
		const addItemsResponse = await addItemsToProjectV2(items.nodes);

		if (addItemsResponse) {
			console.log('Successfully added items to project: ', title);
		} else {
			throw new Error("Couldn't add items to project: ", title);
		}
	}
};

const addProjectsV2Items = async (options) => {
	try {
		const { organization, inputFile, token: pat } = options;
		org = organization;
		token = pat;
		const projectsData = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
		const projects = projectsData.data.organization.projectsV2.nodes;
		const ownerId = await getOwnerId(organization);

		await addProjects(projects, ownerId);
	} catch (err) {
		console.log(err);
	}
};

export default addProjectsV2Items;
