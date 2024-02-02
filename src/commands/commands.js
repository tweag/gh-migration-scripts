#!/usr/bin/env node

import compareRepoDirectCollaborators from '../api/compare/ghes-vs-ghec/repo-direct-collaborators.js';
import compareTeams from '../api/compare/ghes-vs-ghec/teams.js';
import generateGithubMigrationScript from '../api/export/github/repos/generate-github-migration-script.js';
import ghecLastCommitCheck from '../api/compare/ghec-last-commit-check.js';
import exportGithubMissingRepos from '../api/export/github/repos/export-github-missing-repos.js';
import {
	handleToken,
	handleInputFile,
	handleOrg,
	handleUsername,
	handleServerUrl,
} from './handlers.js';
import exportGithubRepoBranches from '../api/export/github/repos/export-github-repo-branches.js';
import exportGithubSelfHostedRunners from '../api/export/github/actions/export-github-self-hosted-runners.js';
import exportGithubRepoDirectCollaborators from '../api/export/github/repos/export-github-repo-direct-collaborators.js';
import importGithubRepoDirectCollaborators from '../api/import/github/repos/import-github-repo-direct-collaborators.js';
import importGithubRepoTeamPermission from '../api/import/github/repos/import-github-repo-team-permission.js';
import setGithubArchivedStatus from '../api/import/github/repos/set-github-archived-status.js';
import importGithubTeams from '../api/import/github/teams/import-github-teams.js';
import deleteGithubRepos from '../api/import/github/repos/delete-github-repos.js';
import importGithubProjectsV2 from '../api/import/github/projects/import-github-projects-v2.js';
import importGithubTeamMembers from '../api/import/github/teams/import-github-team-members.js';
import importGithubMembershipInOrg from '../api/import/github/users/import-github-memberships-in-org.js';
import exportGitlabReposDirectCollaborators from '../api/export/gitlab/repos/export-gitlab-repo-direct-collaborators.js';
import exportGitlabTeamMembers from '../api/export/gitlab/teams/export-gitlab-team-members.js';
import exportOrgUsers from '../api/export/github/users/export-github-org-users.js';
import exportOutsideCollaborators from '../api/export/github/users/export-github-outside-collaborators.js';
import exportGithubRepos from '../api/export/github/repos/export-github-repos.js';
import exportGithubReposMigrationStatus from '../api/export/github/repos/export-github-repos-migration-status.js';
import exportGithubTeamsAndPermissionsTeams from '../api/export/github/teams/export-github-teams-and-permissions.js';
import exportGithubProjectsV1 from '../api/export/github/projects/export-github-projects-v1.js';
import exportGithubProjectsV2 from '../api/export/github/projects/export-github-projects-v2.js';
import exportGitlabRepositories from '../api/export/gitlab/repos/export-gitlab-repos.js';
import exportGitlabTeams from '../api/export/gitlab/teams/export-gitlab-teams.js';
import exportGitlabUsers from '../api/export/gitlab/users/export-gitlab-users.js';
import exportBitbucketRepoBranches from '../api/export/bitbucket/repos/export-bitbucket-repo-branches.js';

const inputFileScripts = [
	exportGithubRepoBranches,
	importGithubRepoDirectCollaborators,
	importGithubRepoTeamPermission,
	setGithubArchivedStatus,
	importGithubTeams,
	deleteGithubRepos,
	generateGithubMigrationScript,
	exportGithubRepoDirectCollaborators,
	importGithubProjectsV2,
	importGithubTeamMembers,
	importGithubMembershipInOrg,
	exportGitlabReposDirectCollaborators,
	exportGitlabTeamMembers,
	exportBitbucketRepoBranches,
];

const orgScripts = [
	exportGithubRepoBranches,
	exportGithubSelfHostedRunners,
	importGithubRepoDirectCollaborators,
	importGithubRepoTeamPermission,
	setGithubArchivedStatus,
	compareTeams,
	deleteGithubRepos,
	exportOrgUsers,
	exportOutsideCollaborators,
	exportGithubRepoDirectCollaborators,
	exportGithubRepos,
	exportGithubReposMigrationStatus,
	exportGithubTeamsAndPermissionsTeams,
	exportGithubProjectsV1,
	exportGithubProjectsV2,
	importGithubProjectsV2,
	importGithubTeamMembers,
	compareTeams,
	compareRepoDirectCollaborators,
	exportGitlabRepositories,
	exportGitlabReposDirectCollaborators,
	exportGitlabTeams,
	exportGitlabTeamMembers,
	exportGitlabUsers,
	importGithubMembershipInOrg,
	generateGithubMigrationScript,
	ghecLastCommitCheck,
	exportGithubMissingRepos,
	exportBitbucketRepoBranches,
];

const serverUrlScripts = [
	ghecLastCommitCheck,
	exportGitlabRepositories,
	exportGitlabTeams,
	exportGitlabTeamMembers,
	exportGitlabUsers,
	generateGithubMigrationScript,
	exportBitbucketRepoBranches,
];

const sourceOrgScripts = [
	exportGithubMissingRepos,
	generateGithubMigrationScript,
	ghecLastCommitCheck,
];

const sourceTokenScripts = [
	exportGithubMissingRepos,
	generateGithubMigrationScript,
];

const excludeTokenScripts = [
	compareRepoDirectCollaborators,
	compareTeams,
	generateGithubMigrationScript,
	ghecLastCommitCheck,
];

const fileScripts = [compareRepoDirectCollaborators, compareTeams];

const setInputFile = async (service, options, field, msg) => {
	if (service === deleteGithubRepos && options.repo) return;

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
	if (!excludeTokenScripts.includes(service))
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

	if (service === importGithubTeams) {
		options.githubUser = await handleUsername(options);
	}

	// if (service === ghecLastCommitCheck) {
	// 	options[GIT_HOST] = await handleGitHost(options);
	// }

	service(options);
};
