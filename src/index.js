#!/usr/bin/env node

import { program } from 'commander';
import { commandController } from './commands/commands.js';
import { setRepoDirectCollaborators } from './api/import/ghec/repos/set-repo-direct-collaborators.js';
import { setRepoTeamPermission } from './api/import/ghec/repos/set-repo-team-permission.js';
import { setArchivedStatus } from './api/import/ghec/repos/set-archived-status.js';
import compareRepoDirectCollaborators from './api/compare/ghes-vs-ghec/repo-direct-collaborators.js';
import compareTeams from './api/compare/ghes-vs-ghec/teams.js';
import { createTeams } from './api/import/ghec/teams/create-teams.js';
import { deleteRepos } from './api/import/ghec/repos/delete-repos.js';
import generateGHESMigrationScript from './api/export/ghes/repos/generate-ghes-migration-script.js';
import { getEnterpriseUsers } from './api/export/ghes/users/get-enterprise-users.js';
import { getOrgUsers } from './api/export/ghes/users/get-org-users.js';
import { getOutsideCollaborators } from './api/export/ghes/users/get-outside-collaborators.js';
import { getRepos } from './api/export/ghes/repos/get-repos.js';
import { getReposDirectCollaborators } from './api/export/ghes/repos/get-repo-direct-collaborators.js';
import { getTeams } from './api/export/ghes/teams/get-teams.js';
import getReposMigrationStatus from './api/import/ghec/repos/get-repos-migration-status.js';
import { insertTeamMembers } from './api/import/ghec/teams/insert-team-members.js';
import { setMembershipInOrg } from './api/import/ghec/users/set-memberships-in-org.js';
import { getFunctionName, showModusName } from './services/utils.js';
import ghecLastCommitCheck from './api/compare/ghec-last-commit-check.js';
import getGHECMissingRepos from './api/import/ghec/repos/get-ghec-missing-repos.js';
import exportProjectsV1 from './api/export/ghes/projects/export-projects-v1.js';
import exportProjectsV2 from './api/export/ghes/projects/export-projects-v2.js';
import createProjectsV2 from './api/import/ghec/projects/create-projects-v2.js';

// GitLab
import getGitlabRepositories from './api/export/gitlab/repos/get-gitlab-repos.js';
import getGitlabRepoDirectCollaborators from './api/export/gitlab/repos/get-gitlab-repo-direct-collaborators.js';
import getGitlabTeams from './api/export/gitlab/teams/get-gitlab-teams.js';
import getGitlabTeamMembers from './api/export/gitlab/teams/get-gitlab-team-members.js';
import getGitlabUsers from './api/export/gitlab/users/get-gitlab-users.js';

// Bitbucket
import generateBitbucketMigrationScript from './api/export/bitbucket/repos/generate-bitbucket-migration-script.js';
import getBitbucketRepoTeamPermissions from './api/export/bitbucket/repos/get-bitbucket-repo-team-permissions.js';
import getBitbucketRepositories from './api/export/bitbucket/repos/get-bitbucket-repos.js';
import getBitbucketRepoDirectCollaborators from './api/export/bitbucket/repos/get-bitbucket-repo-direct-collaborators.js';
import getBitbucketTeams from './api/export/bitbucket/teams/get-bitbucket-teams.js';
import getBitbucketTeamMembers from './api/export/bitbucket/teams/get-bitbucket-teams-members.js';
import getBitbucketProjectUsers from './api/export/bitbucket/users/get-bitbucket-project-users.js';
import getBitbucketEnterpriseUsers from './api/export/bitbucket/users/get-bitbucket-enterprise-users.js';

const args = {
	allowUntrustedSslCertificates: {
		argument: '-a, --allow-untrusted-ssl-certificates',
		description:
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
	.command(getFunctionName(setRepoDirectCollaborators))
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
		commandController(process.env.PAT, args, setRepoDirectCollaborators),
	);

program
	.command(getFunctionName(setRepoTeamPermission))
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
		commandController(process.env.PAT, args, setRepoTeamPermission),
	);

program
	.command(getFunctionName(setArchivedStatus))
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
		commandController(process.env.PAT, args, setArchivedStatus),
	);

program
	.command(getFunctionName(createTeams))
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
		commandController(process.env.PAT, args, createTeams),
	);

program
	.command(getFunctionName(deleteRepos))
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
		commandController(process.env.PAT, args, deleteRepos),
	);

program
	.command(getFunctionName(generateGHESMigrationScript))
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
		commandController('', args, generateGHESMigrationScript),
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
	.requiredOption(args.file.argument, 'Input file name with repository info')
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
	.command(getFunctionName(getEnterpriseUsers))
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
		'List of organizations on the enterprise',
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
	.alias('geu')
	.description('Fetches all users on the enterprise')
	.action(async (args) =>
		commandController(process.env.PAT, args, getEnterpriseUsers),
	);

program
	.command(getFunctionName(getBitbucketEnterpriseUsers))
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
	.description('Fetches all users on the Bitbucket enterprise')
	.action(async (args) =>
		commandController(process.env.PAT, args, getBitbucketEnterpriseUsers),
	);

program
	.command(getFunctionName(getOrgUsers))
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
	.alias('gou')
	.description("Fetches users' details in an organization")
	.action(async (args) =>
		commandController(process.env.PAT, args, getOrgUsers),
	);

program
	.command(getFunctionName(getBitbucketProjectUsers))
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
	.description("Fetches users' details in a Bitbucket project")
	.action(async (args) =>
		commandController(process.env.PAT, args, getBitbucketProjectUsers),
	);

program
	.command(getFunctionName(getOutsideCollaborators))
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
	.alias('goc')
	.description('Fetches outside collaborators of an organization')
	.action(async (args) =>
		commandController(process.env.PAT, args, getOutsideCollaborators),
	);

program
	.command(getFunctionName(getReposDirectCollaborators))
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
	.alias('grdc')
	.description(
		'Fetches the direct collaborators of repositories in an organization',
	)
	.action(async (args) =>
		commandController(process.env.PAT, args, getReposDirectCollaborators),
	);

program
	.command(getFunctionName(getRepos))
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
	.alias('gr')
	.description('Fetches all repositories of an organization')
	.action(async (args) => commandController(process.env.PAT, args, getRepos));

program
	.command(getFunctionName(getReposMigrationStatus))
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
	.alias('gpms')
	.description('Fetches migration status of repositories in an organization')
	.action(async (args) =>
		commandController(process.env.PAT, args, getReposMigrationStatus),
	);

program
	.command(getFunctionName(getTeams))
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
	.alias('gt')
	.description(
		'Fetches all teams of an organization along with repo team permissions and team memberships.',
	)
	.action(async (args) => commandController(process.env.PAT, args, getTeams));

program
	.command(getFunctionName(exportProjectsV1))
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
	.alias('epv1')
	.description('Fetches all V1 projects of an organization')
	.action(async (args) =>
		commandController(process.env.PAT, args, exportProjectsV1),
	);

program
	.command(getFunctionName(exportProjectsV2))
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
	.alias('epv2')
	.description('Fetches all V2 projects of an organization')
	.action(async (args) =>
		commandController(process.env.PAT, args, exportProjectsV2),
	);

program
	.command(getFunctionName(createProjectsV2))
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
		commandController(process.env.PAT, args, createProjectsV2),
	);

program
	.command(getFunctionName(insertTeamMembers))
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
		commandController(process.env.PAT, args, insertTeamMembers),
	);

program
	.command(getFunctionName(setMembershipInOrg))
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
		commandController(process.env.PAT, args, setMembershipInOrg),
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
		"Compares corresponding repositories' between source and GHEC for an organization for last updates and optionally deletes out-of-sync repositories in GHEC",
	)
	.action(async (args) => commandController('', args, ghecLastCommitCheck));

program
	.command(getFunctionName(getGHECMissingRepos))
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
		'Fetches the missing repositories in GHEC during and after migration',
	)
	.action(async (args) => commandController('', args, getGHECMissingRepos));

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
	.command(getFunctionName(getGitlabRepositories))
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
	.description('Fetches all repositories of a Gitlab organization.')
	.action(async (args) =>
		commandController(process.env.PAT, args, getGitlabRepositories),
	);

program
	.command(getFunctionName(getGitlabRepoDirectCollaborators))
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
		'Fetches direct collaborators of all repositories of a Gitlab organization.',
	)
	.action(async (args) =>
		commandController(process.env.PAT, args, getGitlabRepoDirectCollaborators),
	);

program
	.command(getFunctionName(getGitlabTeams))
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
	.description('Fetches all teams of a Gitlab organization.')
	.action(async (args) =>
		commandController(process.env.PAT, args, getGitlabTeams),
	);

program
	.command(getFunctionName(getGitlabTeamMembers))
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
	.description('Fetches members of all teams of a Gitlab organization')
	.action(async (args) =>
		commandController(process.env.PAT, args, getGitlabTeamMembers),
	);

program
	.command(getFunctionName(getGitlabUsers))
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
	.description('Fetches all users of a Gitlab organization')
	.action(async (args) =>
		commandController(process.env.PAT, args, getGitlabUsers),
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
	.requiredOption(args.file.argument, 'Input file name with repository info')
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
	.command(getFunctionName(getBitbucketEnterpriseUsers))
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
	.description('Fetches all users on the Bitbucket enterprise')
	.action(async (args) =>
		commandController(process.env.PAT, args, getBitbucketEnterpriseUsers),
	);

program
	.command(getFunctionName(getBitbucketProjectUsers))
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
	.description("Fetches users' details in a Bitbucket project")
	.action(async (args) =>
		commandController(process.env.PAT, args, getBitbucketProjectUsers),
	);

program
	.command(getFunctionName(getBitbucketRepositories))
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
		'Fetches all repositories of a bitbucket organization (workspace)',
	)
	.action(async (args) =>
		commandController(process.env.PAT, args, getBitbucketRepositories),
	);

program
	.command(getFunctionName(getBitbucketRepoDirectCollaborators))
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
		'Fetches users permissions of all repositories of a bitbucket organization (workspace)',
	)
	.action(async (args) =>
		commandController(
			process.env.PAT,
			args,
			getBitbucketRepoDirectCollaborators,
		),
	);

program
	.command(getFunctionName(getBitbucketTeams))
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
	.description('Fetches all teams of a Bitbucket project.')
	.action(async (args) =>
		commandController(process.env.PAT, args, getBitbucketTeams),
	);

program
	.command(getFunctionName(getBitbucketRepoTeamPermissions))
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
		'Fetches team permissions of all repositories of a bitbucket project',
	)
	.action(async (args) =>
		commandController(process.env.PAT, args, getBitbucketRepoTeamPermissions),
	);

program
	.command(getFunctionName(getBitbucketTeamMembers))
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
	.description('Fetches team members of a bitbucket project.')
	.action(async (args) =>
		commandController(process.env.PAT, args, getBitbucketTeamMembers),
	);

showModusName();

program.parse(process.argv);
