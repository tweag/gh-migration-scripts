#!/usr/bin/env node
/* eslint-disable no-undef */

import { program } from 'commander';
import { commandController } from './commands/commands.js';
import { getFunctionName } from './services/utils.js';

// GitHub
import importGithubRepoDirectCollaborators from './api/import/github/repos/import-github-repo-direct-collaborators.js';
import importGithubRepoTeamPermission from './api/import/github/repos/import-github-repo-team-permission.js';
import setGithubArchivedStatus from './api/import/github/repos/set-github-archived-status.js';
import compareRepoDirectCollaborators from './api/compare/ghes-vs-ghec/repo-direct-collaborators.js';
import compareTeams from './api/compare/ghes-vs-ghec/teams.js';
import importGithubTeams from './api/import/github/teams/import-github-teams.js';
import deleteGithubRepos from './api/import/github/repos/delete-github-repos.js';
import generateGithubMigrationScript from './api/export/github/repos/generate-github-migration-script.js';
import exportGithubEnterpriseUsers from './api/export/github/users/export-github-enterprise-users.js';
import exportGithubOrgUsers from './api/export/github/users/export-github-org-users.js';
import exportGithubOutsideCollaborators from './api/export/github/users/export-github-outside-collaborators.js';
import exportGithubRepos from './api/export/github/repos/export-github-repos.js';
import exportGithubRepoDirectCollaborators from './api/export/github/repos/export-github-repo-direct-collaborators.js';
import exportGithubTeamsAndPermissions from './api/export/github/teams/export-github-teams-and-permissions.js';
import exportGithubReposMigrationStatus from './api/export/github/repos/export-github-repos-migration-status.js';
import importGithubTeamMembers from './api/import/github/teams/import-github-team-members.js';
import importGithubMembershipInOrg from './api/import/github/users/import-github-memberships-in-org.js';
import ghecLastCommitCheck from './api/compare/ghec-last-commit-check.js';
import exportGithubMissingRepos from './api/export/github/repos/export-github-missing-repos.js';
import exportGithubProjectsV1 from './api/export/github/projects/export-github-projects-v1.js';
import exportGithubProjectsV2 from './api/export/github/projects/export-github-projects-v2.js';
import importGithubProjectsV2 from './api/import/github/projects/import-github-projects-v2.js';
import exportGithubRepoBranches from './api/export/github/repos/export-github-repo-branches.js';

// GitLab
import exportGitlabRepositories from './api/export/gitlab/repos/export-gitlab-repos.js';
import exportGitlabRepoDirectCollaborators from './api/export/gitlab/repos/export-gitlab-repo-direct-collaborators.js';
import exportGitlabRepoBranches from './api/export/gitlab/repos/export-gitlab-repo-branches.js';
import exportGitlabTeams from './api/export/gitlab/teams/export-gitlab-teams.js';
import exportGitlabTeamMembers from './api/export/gitlab/teams/export-gitlab-team-members.js';
import exportGitlabUsers from './api/export/gitlab/users/export-gitlab-users.js';

// Bitbucket
import exportBitbucketRepoBranches from './api/export/bitbucket/repos/export-bitbucket-repo-branches.js';
import generateBitbucketMigrationScript from './api/export/bitbucket/repos/generate-bitbucket-migration-script.js';
import exportBitbucketRepoTeamPermissions from './api/export/bitbucket/repos/export-bitbucket-repo-team-permissions.js';
import exportBitbucketRepo from './api/export/bitbucket/repos/export-bitbucket-repos.js';
import exportBitbucketRepoDirectCollaborators from './api/export/bitbucket/repos/export-bitbucket-repo-direct-collaborators.js';
import exportBitbucketTeams from './api/export/bitbucket/teams/export-bitbucket-teams.js';
import exportBitbucketTeamMembers from './api/export/bitbucket/teams/export-bitbucket-teams-members.js';
import exportBitbucketProjectUsers from './api/export/bitbucket/users/export-bitbucket-project-users.js';
import exportBitbucketEnterpriseUsers from './api/export/bitbucket/users/export-bitbucket-enterprise-users.js';

const args = {
	allowUntrustedSslCertificates: {
		argument: '-a, --allow-untrusted-ssl-certificates',
		description:
			// eslint-disable-next-line quotes
			"Allow connections to a GitHub API endpoint that presents a SSL certificate that isn't issued by a trusted CA",
		defaultValue: false,
	},
	batchSize: {
		argument: '-b, --batch-size <BATCH SIZE>',
		description: 'Batch size to call at once for the API requests',
		defaultValue: 50,
	},
	inputFile: {
		argument: '-f, --input-file <INPUT FILE>',
		description: '',
		defaultValue: '',
	},
	serverUrl: {
		argument: '-g, --server-url <GITHUB SERVER URL>',
		description:
			'The server endpoint url, for eg. https://github.gh-services-partners.com.',
		defaultValue: '',
	},
	organization: {
		argument: '-o, --organization <ORGANIZATION>',
		description: 'Organization name',
		defaultValue: '',
	},
	reposFile: {
		argument: '-r, --repos-file <REPOS FILE>',
		description: 'File with repos names so only those repos will be considered',
		defaultValue: '',
	},
	token: {
		argument: '-t, --token <PAT>',
		description: 'Personal Access Token',
		defaultValue: '',
	},
	skip: {
		argument: '-s, --skip <SKIP>',
		description: 'Number of lines to skip in the input file',
		defaultValue: 0,
	},
	waitTime: {
		argument: '-w, --wait-time <WAIT TIME>',
		description: 'Delay time (in seconds) to wait between requests',
		defaultValue: 1,
	},
	outputFile: {
		argument: '-y, --output-file <OUTPUT FILE>',
		description: 'Output file to save the operation results',
		defaultValue: '',
	},
	usersFile: {
		argument: '-u, --users-file <USERS FILE>',
		description: 'File with user names so only those users will be considered',
		defaultValue: '',
	},
};

program
	.command(getFunctionName(importGithubRepoDirectCollaborators))
	.option(
		'-d, --is-delete',
		'If set then the collaborators will be deleted from the repositories',
	)
	.option(
		args.inputFile.argument,
		'Input file name with repo, collaborators & roles info',
	)
	.option(args.serverUrl.argument, args.serverUrl.description)
	.option(args.organization.argument, args.organization.description)
	.option(args.outputFile.argument, args.outputFile.description)
	.option(args.token.argument, args.token.description)
	.option(args.reposFile.argument, args.reposFile.description)
	.option(args.skip.argument, args.skip.description, args.skip.defaultValue)
	.option(
		args.waitTime.argument,
		args.waitTime.description,
		args.waitTime.defaultValue,
	)
	.alias('src')
	.description(
		'Adds or deletes direct collaborators of repositories in an organization',
	)
	.action(async (args) =>
		commandController(
			process.env.PAT,
			args,
			importGithubRepoDirectCollaborators,
		),
	);

program
	.command(getFunctionName(importGithubRepoTeamPermission))
	.option(
		args.inputFile.argument,
		'Input file name with repo, team & permission info',
	)
	.option(args.serverUrl.argument, args.serverUrl.description)
	.option(args.organization.argument, args.organization.description)
	.option(args.outputFile.argument, args.outputFile.description)
	.option(args.token.argument, args.token.description)
	.option(args.reposFile.argument, args.reposFile.description)
	.option(args.skip.argument, args.skip.description, args.skip.defaultValue)
	.option(
		args.waitTime.argument,
		args.waitTime.description,
		args.waitTime.defaultValue,
	)
	.alias('srtp')
	.description(
		'Add teams with permissions to the repositories in an organization',
	)
	.action(async (args) =>
		commandController(process.env.PAT, args, importGithubRepoTeamPermission),
	);

program
	.command(getFunctionName(setGithubArchivedStatus))
	.option(
		args.inputFile.argument,
		'Input file name with repo names, if --repo is not specified',
	)
	.option(args.serverUrl.argument, args.serverUrl.description)
	.option(args.organization.argument, args.organization.description)
	.option(args.outputFile.argument, args.outputFile.description)
	.option(
		'-r, --repo <REPO>',
		'A single repo name to archive/unarchive, takes precedence over file. If not given, the --input-file option should be given instead',
	)
	.option(args.token.argument, args.token.description)
	.option(args.skip.argument, args.skip.description, args.skip.defaultValue)
	.option(
		'-u, --unarchive',
		'Boolean value, if set it will unarchive archived repos, if not set it will archive repos',
	)
	.option(
		args.waitTime.argument,
		args.waitTime.description,
		args.waitTime.defaultValue,
	)
	.alias('ar')
	.description('Archive or unarchive repositories in an organization')
	.action(async (args) =>
		commandController(process.env.PAT, args, setGithubArchivedStatus),
	);

program
	.command(getFunctionName(importGithubTeams))
	.option(args.inputFile.argument, 'Input file name with teams info')
	.option(args.serverUrl.argument, args.serverUrl.description)
	.option(args.organization.argument, args.organization.description)
	.option(args.outputFile.argument, args.outputFile.description)
	.option(args.token.argument, args.token.description)
	.option(args.skip.argument, args.skip.description, args.skip.defaultValue)
	.option(
		args.waitTime.argument,
		args.waitTime.description,
		args.waitTime.defaultValue,
	)
	.option(
		'-z, --github-user <GITHUB USER>',
		'GitHub username who is performing the operation, to delete the user after the team is created, because by default when a team is created, the user who created it will be added to the team',
	)
	.alias('ct')
	.description('Create teams in an organization')
	.action(async (args) =>
		commandController(process.env.PAT, args, importGithubTeams),
	);

program
	.command(getFunctionName(deleteGithubRepos))
	.option(
		args.inputFile.argument,
		'Input file name with repository names to delete',
	)
	.option('-r, --repo <REPO>', 'A single repo name to delete')
	.option(args.serverUrl.argument, args.serverUrl.description)
	.option(args.organization.argument, args.organization.description)
	.option(args.outputFile.argument, args.outputFile.description)
	.option(args.token.argument, args.token.description)
	.option(args.skip.argument, args.skip.description, args.skip.defaultValue)
	.option(
		args.waitTime.argument,
		args.waitTime.description,
		args.waitTime.defaultValue,
	)
	.alias('dr')
	.description('Delete repositories in an organization')
	.action(async (args) =>
		commandController(process.env.PAT, args, deleteGithubRepos),
	);

program
	.command(getFunctionName(generateGithubMigrationScript))
	.option(
		'-a, --archive <ARCHIVE>',
		'Generate script for archive repositories only',
	)
	.option(
		'-u, --unarchive <UNARCHIVE>',
		'Generate script for un-archived repositories only',
	)
	.option(args.organization.argument, 'GHEC destination organization name')
	.option(args.inputFile.argument, 'Input file name with repository info')
	.option(
		'-s, --source-org <SOURCE ORGANIZATION>',
		'GHES source organization name',
	)
	.option(args.token.argument, 'GHEC destination token')
	.option('-l, --source-token <SOURCE TOKEN>', 'GHES destination token')
	.option(args.serverUrl.argument, args.serverUrl.description)
	.option(
		'-v, --visibility <VISIBILITY>',
		'Visibility of the repositories on the GHEC server',
	)
	.option(args.outputFile.argument, args.outputFile.description)
	.alias('ggms')
	.description('Generates GHES migration script')
	.action(async (args) =>
		commandController('', args, generateGithubMigrationScript),
	);

program
	.command(getFunctionName(generateBitbucketMigrationScript))
	.option(
		'-a, --archive <ARCHIVE>',
		'Generate script for archive repositories only',
	)
	.option(
		'-u, --unarchive <UNARCHIVE>',
		'Generate script for un-archived repositories only',
	)
	.requiredOption(
		'-c, --destination-org <DESTINATION ORGANIZATION>',
		'GHEC destination organization name',
	)
	.requiredOption(
		'-w, --aws-bucket-name <AWS BUCKET NAME>',
		'AWS bucket name to store the repository data',
	)
	.requiredOption('-h, --ssh-user <SSH USER>', 'Ssh user')
	.requiredOption(
		args.inputFile.argument,
		'Input file name with repository info',
	)
	.requiredOption(
		'-s, --bitbucket-project <BITBUCKET PROJECT>',
		'Bitbucket source project name',
	)
	.requiredOption(
		'-d, --destination-token <DESTINATION TOKEN>',
		'GHEC destination token',
	)
	.requiredOption(
		'-t, --source-token <SOURCE TOKEN>',
		'Bitbucket destination token',
	)
	.requiredOption(args.serverUrl.argument, args.serverUrl.description)
	.option(
		'-v, --visibility <VISIBILITY>',
		'Visibility of the repositories on the GHEC server',
	)
	.option(args.outputFile.argument, args.outputFile.description)
	.alias('gbms')
	.description('Generates Bitbucket migration script')
	.action(async (args) =>
		commandController('', args, generateBitbucketMigrationScript),
	);

program
	.command(getFunctionName(exportGithubEnterpriseUsers))
	.option(
		args.allowUntrustedSslCertificates.argument,
		args.allowUntrustedSslCertificates.description,
	)
	.option(
		args.batchSize.argument,
		args.batchSize.description,
		args.batchSize.defaultValue,
	)
	.option(
		'-e, --enterprise-organizations <ENTERPRISE ORGANIZATION...>',
		'List of organizations on the enterprise. Usage: -e org1 org2 org3',
	)
	.option(args.serverUrl.argument, args.serverUrl.description)
	.option(args.outputFile.argument, args.outputFile.description)
	.option(args.token.argument, args.token.description)
	.option(args.usersFile.argument, args.usersFile.description)
	.option(
		args.waitTime.argument,
		args.waitTime.description,
		args.waitTime.defaultValue,
	)
	.alias('egeu')
	.description('Exports all users on the enterprise')
	.action(async (args) =>
		commandController(process.env.PAT, args, exportGithubEnterpriseUsers),
	);

program
	.command(getFunctionName(exportBitbucketEnterpriseUsers))
	.option(
		args.batchSize.argument,
		args.batchSize.description,
		args.batchSize.defaultValue,
	)
	.option(
		'-e, --enterprise-organizations <ENTERPRISE ORGANIZATION...>',
		'List of organizations on the enterprise',
	)
	.requiredOption(args.serverUrl.argument, args.serverUrl.description)
	.option(args.outputFile.argument, args.outputFile.description)
	.option(args.token.argument, args.token.description)
	.option(args.usersFile.argument, args.usersFile.description)
	.option(
		args.waitTime.argument,
		args.waitTime.description,
		args.waitTime.defaultValue,
	)
	.alias('gbeu')
	.description('Exports all users on the Bitbucket enterprise')
	.action(async (args) =>
		commandController(process.env.PAT, args, exportBitbucketEnterpriseUsers),
	);

program
	.command(getFunctionName(exportGithubOrgUsers))
	.option(
		args.allowUntrustedSslCertificates.argument,
		args.allowUntrustedSslCertificates.description,
	)
	.option(
		args.batchSize.argument,
		args.batchSize.description,
		args.batchSize.defaultValue,
	)
	.option(args.serverUrl.argument, args.serverUrl.description)
	.option(args.organization.argument, args.organization.description)
	.option(args.outputFile.argument, args.outputFile.description)
	.option(args.token.argument, args.token.description)
	.option(args.usersFile.argument, args.usersFile.description)
	.option(
		args.waitTime.argument,
		args.waitTime.description,
		args.waitTime.defaultValue,
	)
	.alias('egou')
	// eslint-disable-next-line quotes
	.description(`Exports users' details in an organization`)
	.action(async (args) =>
		commandController(process.env.PAT, args, exportGithubOrgUsers),
	);

program
	.command(getFunctionName(exportBitbucketProjectUsers))
	.option(
		args.batchSize.argument,
		args.batchSize.description,
		args.batchSize.defaultValue,
	)
	.requiredOption(args.serverUrl.argument, args.serverUrl.description)
	.requiredOption(args.organization.argument, args.organization.description)
	.option(args.outputFile.argument, args.outputFile.description)
	.option(args.token.argument, args.token.description)
	.option(args.usersFile.argument, args.usersFile.description)
	.option(
		args.waitTime.argument,
		args.waitTime.description,
		args.waitTime.defaultValue,
	)
	.alias('gbpu')
	// eslint-disable-next-line quotes
	.description("Exports users' details in a Bitbucket project")
	.action(async (args) =>
		commandController(process.env.PAT, args, exportBitbucketProjectUsers),
	);

program
	.command(getFunctionName(exportGithubOutsideCollaborators))
	.option(args.serverUrl.argument, args.serverUrl.description)
	.option(args.organization.argument, args.organization.description)
	.option(args.outputFile.argument, args.outputFile.description)
	.option(args.token.argument, args.token.description)
	.option(args.usersFile.argument, args.usersFile.description)
	.option(
		args.waitTime.argument,
		args.waitTime.description,
		args.waitTime.defaultValue,
	)
	.alias('egoc')
	.description('Exports outside collaborators of an organization')
	.action(async (args) =>
		commandController(process.env.PAT, args, exportGithubOutsideCollaborators),
	);

program
	.command(getFunctionName(exportGithubRepoBranches))
	.option(args.inputFile.argument, 'Input file name with repository names')
	.option(args.serverUrl.argument, args.serverUrl.description)
	.option(args.organization.argument, args.organization.description)
	.option(args.outputFile.argument, args.outputFile.description)
	.option(args.token.argument, args.token.description)
	.option(
		args.waitTime.argument,
		args.waitTime.description,
		args.waitTime.defaultValue,
	)
	.alias('egrb')
	.description('Exports branches of given repositories of an organization')
	.action(async (args) =>
		commandController(process.env.PAT, args, exportGithubRepoBranches),
	);

program
	.command(getFunctionName(exportGithubRepoDirectCollaborators))
	.option(
		'-c, --outside-collaborators-file <OUTSIDE COLLABORATORS FILE>',
		'Outside collaborators files to filter out the result',
	)
	.option(args.inputFile.argument, 'Input file with repository names')
	.option(args.serverUrl.argument, args.serverUrl.description)
	.option(args.organization.argument, args.organization.description)
	.option(args.outputFile.argument, args.outputFile.description)
	.option(args.token.argument, args.token.description)
	.option(args.skip.argument, args.skip.description, args.skip.defaultValue)
	.option(args.usersFile.argument, args.usersFile.description)
	.option(
		args.waitTime.argument,
		args.waitTime.description,
		args.waitTime.defaultValue,
	)
	.alias('egrdc')
	.description(
		'Exports the direct collaborators of repositories in an organization',
	)
	.action(async (args) =>
		commandController(
			process.env.PAT,
			args,
			exportGithubRepoDirectCollaborators,
		),
	);

program
	.command(getFunctionName(exportGithubRepos))
	.option(
		args.allowUntrustedSslCertificates.argument,
		args.allowUntrustedSslCertificates.description,
	)
	.option(
		args.batchSize.argument,
		args.batchSize.description,
		args.batchSize.defaultValue,
	)
	.option(args.serverUrl.argument, args.serverUrl.description)
	.option(args.organization.argument, args.organization.description)
	.option(args.outputFile.argument, args.outputFile.description)
	.option(args.token.argument, args.token.description)
	.option(
		args.waitTime.argument,
		args.waitTime.description,
		args.waitTime.defaultValue,
	)
	.alias('egr')
	.description('Exports all repositories of an organization')
	.action(async (args) =>
		commandController(process.env.PAT, args, exportGithubRepos),
	);

program
	.command(getFunctionName(exportGithubReposMigrationStatus))
	.option(
		args.allowUntrustedSslCertificates.argument,
		args.allowUntrustedSslCertificates.description,
	)
	.option(
		args.batchSize.argument,
		args.batchSize.description,
		args.batchSize.defaultValue,
	)
	.option(args.organization.argument, args.organization.description)
	.option(args.outputFile.argument, args.outputFile.description)
	.option(args.token.argument, args.token.description)
	.option(
		args.waitTime.argument,
		args.waitTime.description,
		args.waitTime.defaultValue,
	)
	.alias('egrms')
	.description('Exports migration status of repositories in an organization')
	.action(async (args) =>
		commandController(process.env.PAT, args, exportGithubReposMigrationStatus),
	);

program
	.command(getFunctionName(exportGithubTeamsAndPermissions))
	.option(
		args.allowUntrustedSslCertificates.argument,
		args.allowUntrustedSslCertificates.description,
	)
	.option(
		args.batchSize.argument,
		args.batchSize.description,
		args.batchSize.defaultValue,
	)
	.option(args.serverUrl.argument, args.serverUrl.description)
	.option(args.organization.argument, args.organization.description)
	.option(args.outputFile.argument, args.outputFile.description)
	.option(args.token.argument, args.token.description)
	.option(args.usersFile.argument, args.usersFile.description)
	.option(
		args.waitTime.argument,
		args.waitTime.description,
		args.waitTime.defaultValue,
	)
	.alias('egtp')
	.description(
		'Exports all teams of an organization along with repo team permissions and team memberships.',
	)
	.action(async (args) =>
		commandController(process.env.PAT, args, exportGithubTeamsAndPermissions),
	);

program
	.command(getFunctionName(exportGithubProjectsV1))
	.option(
		args.allowUntrustedSslCertificates.argument,
		args.allowUntrustedSslCertificates.description,
	)
	.option(args.organization.argument, args.organization.description)
	.option(
		args.batchSize.argument,
		args.batchSize.description,
		args.batchSize.defaultValue,
	)
	.option(args.serverUrl.argument, args.serverUrl.description)
	.option(args.outputFile.argument, args.outputFile.description)
	.option(args.token.argument, args.token.description)
	.option(
		args.waitTime.argument,
		args.waitTime.description,
		args.waitTime.defaultValue,
	)
	.alias('egpv1')
	.description('Exports all V1 projects of an organization')
	.action(async (args) =>
		commandController(process.env.PAT, args, exportGithubProjectsV1),
	);

program
	.command(getFunctionName(exportGithubProjectsV2))
	.option(
		args.allowUntrustedSslCertificates.argument,
		args.allowUntrustedSslCertificates.description,
	)
	.option(args.organization.argument, args.organization.description)
	.option(
		args.batchSize.argument,
		args.batchSize.description,
		args.batchSize.defaultValue,
	)
	.option(args.serverUrl.argument, args.serverUrl.description)
	.option(args.outputFile.argument, args.outputFile.description)
	.option(args.token.argument, args.token.description)
	.option(
		args.waitTime.argument,
		args.waitTime.description,
		args.waitTime.defaultValue,
	)
	.alias('egpv2')
	.description('Exports all V2 projects of an organization')
	.action(async (args) =>
		commandController(process.env.PAT, args, exportGithubProjectsV2),
	);

program
	.command(getFunctionName(importGithubProjectsV2))
	.option(args.organization.argument, args.organization.description)
	.option(args.inputFile.argument, 'Input file name with projects info')
	.option(args.outputFile.argument, args.outputFile.description)
	.option(
		args.waitTime.argument,
		args.waitTime.description,
		args.waitTime.defaultValue,
	)
	.option(args.token.argument, args.token.description)
	.option(args.skip.argument, args.skip.description, args.skip.defaultValue)
	.alias('cpv2')
	.description('Creates V2 projects in an organization')
	.action(async (args) =>
		commandController(process.env.PAT, args, importGithubProjectsV2),
	);

program
	.command(getFunctionName(importGithubTeamMembers))
	.option(
		args.inputFile.argument,
		'Input file name with teams, member, and roles',
	)
	.option(args.serverUrl.argument, args.serverUrl.description)
	.option(args.organization.argument, args.organization.description)
	.option(args.outputFile.argument, args.outputFile.description)
	.option(args.token.argument, args.token.description)
	.option(args.skip.argument, args.skip.description, args.skip.defaultValue)
	.option(
		args.waitTime.argument,
		args.waitTime.description,
		args.waitTime.defaultValue,
	)
	.alias('itm')
	.description('Inserts members to teams with the specified roles')
	.action(async (args) =>
		commandController(process.env.PAT, args, importGithubTeamMembers),
	);

program
	.command(getFunctionName(importGithubMembershipInOrg))
	.option('-d, --delete-members', 'Delete members from an organization')
	.option(args.inputFile.argument, 'Input file name with members name')
	.option(args.serverUrl.argument, args.serverUrl.description)
	.option(args.organization.argument, args.organization.description)
	.option(args.outputFile.argument, args.outputFile.description)
	.option(args.token.argument, args.token.description)
	.option(args.skip.argument, args.skip.description, args.skip.defaultValue)
	.option(
		args.waitTime.argument,
		args.waitTime.description,
		args.waitTime.defaultValue,
	)
	.alias('smio')
	.description('Adds/removes members from an organization')
	.action(async (args) =>
		commandController(process.env.PAT, args, importGithubMembershipInOrg),
	);

program
	.command(getFunctionName(compareTeams))
	.option('-c, --ghec-file <GHEC FILE>', 'GHEC team metrics file')
	.option('-s, --ghes-file <GHES FILE>', 'GHES team metrics file')
	.option(args.organization.argument, args.organization.description)
	.option(args.usersFile.argument, args.usersFile.description)
	.alias('ct')
	.description('Compares team metrics for GHES and GHEC for an organization')
	.action(async (args) => commandController('', args, compareTeams));

program
	.command(getFunctionName(ghecLastCommitCheck))
	.option(
		args.batchSize.argument,
		args.batchSize.description,
		args.batchSize.defaultValue,
	)
	.option('-f, --input-file <INPUT FILE>', 'Source repo names file')
	.option(args.organization.argument, 'GHEC organization name')
	.option(
		'-q, --source-org <SOURCE ORGANIZATION NAME>',
		'Source organization name',
	)
	.option('-h, --source-token <SOURCE TOKEN>', 'Source organization token')
	.option(args.serverUrl.argument, args.serverUrl.description)
	.option(args.token.argument, args.token.description)
	.option(args.outputFile.argument, args.outputFile.description)
	.option(args.skip.argument, args.skip.description, args.skip.defaultValue)
	.option(
		args.waitTime.argument,
		args.waitTime.description,
		args.waitTime.defaultValue,
	)
	.alias('glcc')
	.description(
		// eslint-disable-next-line quotes
		"Compares corresponding repositories' between source and GHEC for an organization for last updates and optionally deletes out-of-sync repositories in GHEC",
	)
	.action(async (args) => commandController('', args, ghecLastCommitCheck));

program
	.command(getFunctionName(exportGithubMissingRepos))
	.option(
		args.allowUntrustedSslCertificates.argument,
		args.allowUntrustedSslCertificates.description,
	)
	.option(
		args.batchSize.argument,
		args.batchSize.description,
		args.batchSize.defaultValue,
	)
	.option(args.serverUrl.argument, args.serverUrl.description)
	.option(args.token.argument, 'GHEC token')
	.option(
		args.waitTime.argument,
		args.waitTime.description,
		args.waitTime.defaultValue,
	)
	.option(args.organization.argument, 'GHEC organization name')
	.option(
		'-q, --source-org <SOURCE ORGANIZATION NAME>',
		'Source organization name',
	)
	.option('-e, --source-token <SOURCE TOKEN>', 'Source token')
	.option('-h --git-host <GIT HOST>', 'Git host name, eg. github, gitlab, etc.')
	.alias('ghmr')
	.description(
		'Exports the missing repositories in GHEC during and after migration',
	)
	.action(async (args) =>
		commandController('', args, exportGithubMissingRepos),
	);

program
	.command(getFunctionName(compareRepoDirectCollaborators))
	.option('-c, --ghec-file <GHEC FILE>', 'GHEC repo direct collaborators file')
	.option('-s, --ghes-file <GHES FILE>', 'GHES repo direct collaborators file')
	.option(args.organization.argument, args.organization.description)
	.option(args.usersFile.argument, args.usersFile.description)
	.option(
		'-z, --outside-collaborators-file <OUTSIDE COLLABORATORS FILE>',
		'File with outside collaborators names to not be included',
	)
	.alias('crdc')
	.description(
		'Compares repo direct collaborators between GHES and GHEC in an organization',
	)
	.action(async (args) =>
		commandController('', args, compareRepoDirectCollaborators),
	);

// Gitlab

program
	.command(getFunctionName(exportGitlabRepositories))
	.option(
		args.batchSize.argument,
		args.batchSize.description,
		args.batchSize.defaultValue,
	)
	.option(args.serverUrl.argument, args.serverUrl.description)
	.option(args.organization.argument, args.organization.description)
	.option(args.outputFile.argument, args.outputFile.description)
	.option(args.token.argument, args.token.description)
	.option(
		args.waitTime.argument,
		args.waitTime.description,
		args.waitTime.defaultValue,
	)
	.alias('ggr')
	.description('Exports all repositories of a Gitlab organization.')
	.action(async (args) =>
		commandController(process.env.PAT, args, exportGitlabRepositories),
	);

program
	.command(getFunctionName(exportGitlabRepoBranches))
	.option(
		args.batchSize.argument,
		args.batchSize.description,
		args.batchSize.defaultValue,
	)
	.option(args.inputFile.argument, 'Input file with repositories names')
	.option(args.serverUrl.argument, args.serverUrl.description)
	.option(args.organization.argument, args.organization.description)
	.option(args.outputFile.argument, args.outputFile.description)
	.option(args.token.argument, args.token.description)
	.option(
		args.waitTime.argument,
		args.waitTime.description,
		args.waitTime.defaultValue,
	)
	.alias('egrb')
	.description('Exports branches of every repos of a Gitlab organization.')
	.action(async (args) =>
		commandController(process.env.PAT, args, exportGitlabRepoBranches),
	);

program
	.command(getFunctionName(exportGitlabRepoDirectCollaborators))
	.option(
		args.batchSize.argument,
		args.batchSize.description,
		args.batchSize.defaultValue,
	)
	.option(args.inputFile.argument, 'Input file with repositories names')
	.option(args.serverUrl.argument, args.serverUrl.description)
	.option(args.organization.argument, args.organization.description)
	.option(args.outputFile.argument, args.outputFile.description)
	.option(args.token.argument, args.token.description)
	.option(
		args.waitTime.argument,
		args.waitTime.description,
		args.waitTime.defaultValue,
	)
	.alias('ggrdc')
	.description(
		'Exports direct collaborators of all repositories of a Gitlab organization.',
	)
	.action(async (args) =>
		commandController(
			process.env.PAT,
			args,
			exportGitlabRepoDirectCollaborators,
		),
	);

program
	.command(getFunctionName(exportGitlabTeams))
	.option(
		args.batchSize.argument,
		args.batchSize.description,
		args.batchSize.defaultValue,
	)
	.option(args.serverUrl.argument, args.serverUrl.description)
	.option(args.organization.argument, args.organization.description)
	.option(args.outputFile.argument, args.outputFile.description)
	.option(args.token.argument, args.token.description)
	.option(
		args.waitTime.argument,
		args.waitTime.description,
		args.waitTime.defaultValue,
	)
	.alias('ggt')
	.description('Exports all teams of a Gitlab organization.')
	.action(async (args) =>
		commandController(process.env.PAT, args, exportGitlabTeams),
	);

program
	.command(getFunctionName(exportGitlabTeamMembers))
	.option(
		args.batchSize.argument,
		args.batchSize.description,
		args.batchSize.defaultValue,
	)
	.option(args.inputFile.argument, 'Input file with team names')
	.option(args.serverUrl.argument, args.serverUrl.description)
	.option(args.organization.argument, args.organization.description)
	.option(args.outputFile.argument, args.outputFile.description)
	.option(args.token.argument, args.token.description)
	.option(
		args.waitTime.argument,
		args.waitTime.description,
		args.waitTime.defaultValue,
	)
	.alias('ggtm')
	.description('Exports members of all teams of a Gitlab organization')
	.action(async (args) =>
		commandController(process.env.PAT, args, exportGitlabTeamMembers),
	);

program
	.command(getFunctionName(exportGitlabUsers))
	.option(
		args.batchSize.argument,
		args.batchSize.description,
		args.batchSize.defaultValue,
	)
	.option(args.serverUrl.argument, args.serverUrl.description)
	.option(args.organization.argument, args.organization.description)
	.option(args.outputFile.argument, args.outputFile.description)
	.option(args.token.argument, args.token.description)
	.option(
		args.waitTime.argument,
		args.waitTime.description,
		args.waitTime.defaultValue,
	)
	.alias('ggu')
	.description('Exports all users of a Gitlab organization')
	.action(async (args) =>
		commandController(process.env.PAT, args, exportGitlabUsers),
	);

// Bitbucket

program
	.command(getFunctionName(generateBitbucketMigrationScript))
	.option(
		'-a, --archive <ARCHIVE>',
		'Generate script for archive repositories only',
	)
	.option(
		'-u, --unarchive <UNARCHIVE>',
		'Generate script for un-archived repositories only',
	)
	.requiredOption(
		'-c, --destination-org <DESTINATION ORGANIZATION>',
		'GHEC destination organization name',
	)
	.requiredOption(
		'-w, --aws-bucket-name <AWS BUCKET NAME>',
		'AWS bucket name to store the repository data',
	)
	.requiredOption('-h, --ssh-user <SSH USER>', 'Ssh user')
	.requiredOption(
		args.inputFile.argument,
		'Input file name with repository info',
	)
	.requiredOption(
		'-s, --bitbucket-project <BITBUCKET PROJECT>',
		'Bitbucket source project name',
	)
	.requiredOption(
		'-d, --destination-token <DESTINATION TOKEN>',
		'GHEC destination token',
	)
	.requiredOption(
		'-t, --source-token <SOURCE TOKEN>',
		'Bitbucket destination token',
	)
	.requiredOption(args.serverUrl.argument, args.serverUrl.description)
	.option(
		'-v, --visibility <VISIBILITY>',
		'Visibility of the repositories on the GHEC server',
	)
	.option(args.outputFile.argument, args.outputFile.description)
	.alias('gbms')
	.description('Generates Bitbucket migration script')
	.action(async (args) =>
		commandController('', args, generateBitbucketMigrationScript),
	);

program
	.command(getFunctionName(exportBitbucketEnterpriseUsers))
	.option(
		args.batchSize.argument,
		args.batchSize.description,
		args.batchSize.defaultValue,
	)
	.option(
		'-e, --enterprise-organizations <ENTERPRISE ORGANIZATION...>',
		'List of organizations on the enterprise',
	)
	.requiredOption(args.serverUrl.argument, args.serverUrl.description)
	.option(args.outputFile.argument, args.outputFile.description)
	.option(args.token.argument, args.token.description)
	.option(args.usersFile.argument, args.usersFile.description)
	.option(
		args.waitTime.argument,
		args.waitTime.description,
		args.waitTime.defaultValue,
	)
	.alias('gbeu')
	.description('Exports all users on the Bitbucket enterprise')
	.action(async (args) =>
		commandController(process.env.PAT, args, exportBitbucketEnterpriseUsers),
	);

program
	.command(getFunctionName(exportBitbucketProjectUsers))
	.option(
		args.batchSize.argument,
		args.batchSize.description,
		args.batchSize.defaultValue,
	)
	.requiredOption(args.serverUrl.argument, args.serverUrl.description)
	.requiredOption(args.organization.argument, args.organization.description)
	.option(args.outputFile.argument, args.outputFile.description)
	.option(args.token.argument, args.token.description)
	.option(args.usersFile.argument, args.usersFile.description)
	.option(
		args.waitTime.argument,
		args.waitTime.description,
		args.waitTime.defaultValue,
	)
	.alias('gbpu')
	// eslint-disable-next-line quotes
	.description("Exports users' details in a Bitbucket project")
	.action(async (args) =>
		commandController(process.env.PAT, args, exportBitbucketProjectUsers),
	);

program
	.command(getFunctionName(exportBitbucketRepo))
	.option(
		args.batchSize.argument,
		args.batchSize.description,
		args.batchSize.defaultValue,
	)
	.requiredOption(args.serverUrl.argument, args.serverUrl.description)
	.requiredOption(args.organization.argument, args.organization.description)
	.option(args.outputFile.argument, args.outputFile.description)
	.option(args.token.argument, args.token.description)
	.option(
		args.waitTime.argument,
		args.waitTime.description,
		args.waitTime.defaultValue,
	)
	.alias('gbr')
	.description(
		'Exports all repositories of a bitbucket organization (workspace)',
	)
	.action(async (args) =>
		commandController(process.env.PAT, args, exportBitbucketRepo),
	);

program
	.command(getFunctionName(exportBitbucketRepoDirectCollaborators))
	.option(
		args.batchSize.argument,
		args.batchSize.description,
		args.batchSize.defaultValue,
	)
	.option(args.inputFile.argument, 'Input file with repository names')
	.requiredOption(args.serverUrl.argument, args.serverUrl.description)
	.requiredOption(args.organization.argument, args.organization.description)
	.option(args.outputFile.argument, args.outputFile.description)
	.option(args.token.argument, args.token.description)
	.option(
		args.waitTime.argument,
		args.waitTime.description,
		args.waitTime.defaultValue,
	)
	.alias('gbrdc')
	.description(
		'Exports users permissions of all repositories of a bitbucket organization (workspace)',
	)
	.action(async (args) =>
		commandController(
			process.env.PAT,
			args,
			exportBitbucketRepoDirectCollaborators,
		),
	);

program
	.command(getFunctionName(exportBitbucketTeams))
	.option(
		args.batchSize.argument,
		args.batchSize.description,
		args.batchSize.defaultValue,
	)
	.option(args.serverUrl.argument, args.serverUrl.description)
	.requiredOption(args.organization.argument, args.organization.description)
	.option(args.outputFile.argument, args.outputFile.description)
	.option(args.token.argument, args.token.description)
	.option(
		args.waitTime.argument,
		args.waitTime.description,
		args.waitTime.defaultValue,
	)
	.alias('gbt')
	.description('Exports all teams of a Bitbucket project.')
	.action(async (args) =>
		commandController(process.env.PAT, args, exportBitbucketTeams),
	);

program
	.command(getFunctionName(exportBitbucketRepoBranches))
	.option(args.inputFile.argument, 'Input file with repository names')
	.option(args.serverUrl.argument, args.serverUrl.description)
	.requiredOption(args.organization.argument, args.organization.description)
	.option(args.outputFile.argument, args.outputFile.description)
	.option(args.token.argument, args.token.description)
	.option(args.skip.argument, args.skip.description, args.skip.defaultValue)
	.option(
		args.waitTime.argument,
		args.waitTime.description,
		args.waitTime.defaultValue,
	)
	.alias('ebrb')
	.description('Exports branches of all repositories of a bitbucket project')
	.action(async (args) =>
		commandController(process.env.PAT, args, exportBitbucketRepoBranches),
	);

program
	.command(getFunctionName(exportBitbucketRepoTeamPermissions))
	.option(
		args.batchSize.argument,
		args.batchSize.description,
		args.batchSize.defaultValue,
	)
	.option(args.inputFile.argument, 'Input file with repository names')
	.option(args.serverUrl.argument, args.serverUrl.description)
	.requiredOption(args.organization.argument, args.organization.description)
	.option(args.outputFile.argument, args.outputFile.description)
	.option(args.token.argument, args.token.description)
	.option(
		args.waitTime.argument,
		args.waitTime.description,
		args.waitTime.defaultValue,
	)
	.alias('gbrtp')
	.description(
		'Exports team permissions of all repositories of a bitbucket project',
	)
	.action(async (args) =>
		commandController(
			process.env.PAT,
			args,
			exportBitbucketRepoTeamPermissions,
		),
	);

program
	.command(getFunctionName(exportBitbucketTeamMembers))
	.option(
		args.batchSize.argument,
		args.batchSize.description,
		args.batchSize.defaultValue,
	)
	.option(args.serverUrl.argument, args.serverUrl.description)
	.requiredOption(args.organization.argument, args.organization.description)
	.option(args.outputFile.argument, args.outputFile.description)
	.option(args.token.argument, args.token.description)
	.option(
		args.waitTime.argument,
		args.waitTime.description,
		args.waitTime.defaultValue,
	)
	.alias('gbtm')
	.description('Exports team members of a bitbucket project.')
	.action(async (args) =>
		commandController(process.env.PAT, args, exportBitbucketTeamMembers),
	);

// showModusName();

program.parse(process.argv);
