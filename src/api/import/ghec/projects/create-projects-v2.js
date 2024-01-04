import fs from 'fs';
import omit from 'lodash.omit';
import { doRequest } from '../../../../services/utils';

let token;

const getGraphQLConfig = (query) => {
  return {
		method: 'post',
		maxBodyLength: Infinity,
		headers: {
			Authorization: `Bearer ${token}`,
		},
		data: JSON.stringify(query),
  }
}

const getOwnerId = async (organization) => {
  const query = `query {
    organization(login: "${organization}") {
      id
    }
  }`;
  const config = getGraphQLConfig(query, token);
  const response = await doRequest(config);
  return response.data.data.organization.id;
}

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
  return { projectId: response.data.createProjectV2.projectV2.id, fields: response.data.createProjectV2.projectV2.fields.nodes };
}

const updateProjectV2 = async ({ projectId, isPublic, readme, shortDescription }) => {
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
}

const addField = async (name, dataType, projectId, options) => {
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
}

const addCustomFields = async (sourceFields, fields, projectId) => {
  const fieldMap = new Map();

  for (const sourceField of sourceFields) {
    const { name, dataType, __typename } = sourceField;
    const field = fields.find((field) => field.name === name && field.dataType === dataType && field.__typename === __typename);


    if (field) {
      fieldMap.set(name, field.id);
    } else {
      let options;
      if (dataType === 'SINGLE_SELECT') {
        options = field.options;
      }
      const fieldId = await addField(name, dataType, projectId, options);
      fieldMap.set(name, fieldId);
    }
  }
}

const createProjectsV2 = async (options) => {
  try {
    const { organization, inputFile, token: pat } = options;
    token = pat;
    const projectsData = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
    const projects = projectsData.data.organization.projectsV2.nodes;
    const ownerId = await getOwnerId(organization);

    for (const project of projects) {
      const { title, public: isPublic, readme, shortDescription, fields: sourceFields } = project;
      const { projectId, fields } = await createProjectV2(ownerId, title)
      const responseId = await updateProjectV2({ projectId, token, isPublic, readme, shortDescription });

      if (responseId) console.log('Successfully updated project: ', title);

      const addFieldsResponse = await addCustomFields(sourceFields, fields, projectId)
    }
  } catch (err) {
    console.log(err);
  }
}
