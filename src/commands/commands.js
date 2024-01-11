#!/usr/bin/env node

import compareRepoDirectCollaborators from '../api/compare/ghes-vs-ghec/repo-direct-collaborators.js';
import compareTeams from '../api/compare/ghes-vs-ghec/teams.js';
import generateGHESMigrationScript from '../api/export/ghes/repos/generate-ghes-migration-script.js';
import ghecLastCommitCheck from '../api/compare/ghec-last-commit-check.js';
import getGHECMissingRepos from '../api/import/ghec/repos/get-ghec-missing-repos.js';
import {
	handleToken,
	handleInputFile,
	handleOrg,
	handleUsername,
} from './handlers.js';
import { getReposDirectCollaborators } from '../api/export/ghes/repos/get-repo-direct-collaborators.js';
import { setRepoDirectCollaborators } from '../api/import/ghec/repos/set-repo-direct-collaborators.js';
import { setRepoTeamPermission } from '../api/import/ghec/repos/set-repo-team-permission.js';
import { setArchivedStatus } from '../api/import/ghec/repos/set-archived-status.js';
import { createTeams } from '../api/import/ghec/teams/create-teams.js';
import { deleteRepos } from '../api/import/ghec/repos/delete-repos.js';
import createProjectsV2 from '../api/import/ghec/projects/create-projects-v2.js';
import { insertTeamMembers } from '../api/import/ghec/teams/insert-team-members.js';
import { setMembershipInOrg } from '../api/import/ghec/users/set-memberships-in-org.js';
import getGitlabReposDirectCollaborators from '../api/export/gitlab/repos/get-gitlab-repo-direct-collaborators.js';
import getGitlabTeamMembers from '../api/export/gitlab/teams/get-gitlab-team-members.js';
import { getOrgUsers } from '../api/export/ghes/users/get-org-users.js';
import { getOutsideCollaborators } from '../api/export/ghes/users/get-outside-collaborators.js';
import { getRepos } from '../api/export/ghes/repos/get-repos.js';
import getReposMigrationStatus from '../api/import/ghec/repos/get-repos-migration-status.js';
import { getTeams } from '../api/export/ghes/teams/get-teams.js';
import exportProjectsV1 from '../api/export/ghes/projects/export-projects-v1.js';
import exportProjectsV2 from '../api/export/ghes/projects/export-projects-v2.js';
import getGitlabRepositories from '../api/export/gitlab/repos/get-gitlab-repos.js';
import getGitlabTeams from '../api/export/gitlab/teams/get-gitlab-teams.js';
import getGitlabUsers from '../api/export/gitlab/users/get-gitlab-users.js';

const inputFileScripts = [
	setRepoDirectCollaborators,
	setRepoTeamPermission,
	setArchivedStatus,
	createTeams,
	deleteRepos,
	generateGHESMigrationScript,
	getReposDirectCollaborators,
	createProjectsV2,
	insertTeamMembers,
	setMembershipInOrg,
	getGitlabReposDirectCollaborators,
	getGitlabTeamMembers,
];

const orgScripts = [
	setRepoDirectCollaborators,
	setRepoTeamPermission,
	setArchivedStatus,
	compareTeams,
	deleteRepos,
	getOrgUsers,
	getOutsideCollaborators,
	getReposDirectCollaborators,
	getRepos,
	getReposMigrationStatus,
	getTeams,
	exportProjectsV1,
	exportProjectsV2,
	createProjectsV2,
	insertTeamMembers,
	compareTeams,
	compareRepoDirectCollaborators,
	getGitlabRepositories,
	getGitlabReposDirectCollaborators,
	getGitlabTeams,
	getGitlabTeamMembers,
	getGitlabUsers,
	setMembershipInOrg,
	generateGHESMigrationScript,
	ghecLastCommitCheck,
	getGHECMissingRepos,
];

const serverUrlScripts = [
	ghecLastCommitCheck,
	getGitlabRepositories,
	getGitlabTeams,
	getGitlabTeamMembers,
	getGitlabUsers,
	generateGHESMigrationScript,
];

const sourceOrgScripts = [
	getGHECMissingRepos,
	generateGHESMigrationScript,
	ghecLastCommitCheck,
];

const sourceTokenScripts = [getGHECMissingRepos, generateGHESMigrationScript];

const fileScripts = [compareRepoDirectCollaborators, compareTeams];

const setInputFile = async (service, options, field, msg) => {
	if (service === deleteRepos && options.repo) return;

	if (inputFileScripts.includes(service)) {
		return handleInputFile(options, field, msg);
	}
};

/**
 * Generalizes execution of command by User
 *
 * @param {string} PAT the personal access token for the user
 * @param {object} options the information needed for the migration
 * @param {string} service the service to be executed
 */
export const commandController = async (PAT, options, service) => {
	if (
		![
			compareRepoDirectCollaborators,
			compareTeams,
			generateGHESMigrationScript,
			ghecLastCommitCheck,
		].includes(service)
	)
		options.token = await handleToken(PAT, options, 'Enter PAT: ', 'token');

	if (sourceTokenScripts.includes(service)) {
		options.sourceToken = await handleToken(
			options.sourceToken,
			options,
			'Enter Source PAT: ',
			'sourceToken',
		);
	}

	if (fileScripts.includes(service)) {
		options.ghecFile = await handleInputFile(
			options,
			'Enter path to GHES file',
		);
		options.ghecFile = await handleInputFile(
			options,
			'Enter path to GHEC file',
		);
	}

	if (inputFileScripts.includes(service)) {
		options.inputFile = await setInputFile(
			service,
			options,
			'inputFile',
			'Enter path to input file',
		);
	}

	if (orgScripts.includes(service)) {
		options.organization = await handleOrg(
			options,
			'organization',
			'Enter organization name: ',
		);
	}

	if (sourceOrgScripts.includes(service)) {
		options.sourceOrg = await handleOrg(
			options,
			'sourceOrg',
			'Enter source organization name: ',
		);
	}

	if (serverUrlScripts.includes(service)) {
		options.serverUrl = await handleServerUrl(options);
	}

	if (service === createTeams) {
		options.githubUser = await handleUsername(options);
	}

	// if (service === ghecLastCommitCheck) {
	// 	options[GIT_HOST] = await handleGitHost(options);
	// }

	service(options);
};
