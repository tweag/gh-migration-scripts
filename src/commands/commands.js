#!/usr/bin/env node

import prompts from 'prompts';
import {
	GIT_HOST,
	GITHUB_HOST,
	GITLAB_HOST,
} from '../services/constants.js';
import compareRepoDirectCollaborators from '../api/compare/ghes-vs-ghec/repo-direct-collaborators.js';
import compareTeams from '../api/compare/ghes-vs-ghec/teams.js';
import generateGHESMigrationScript from '../api/export/ghes/repos/generate-ghes-migration-script.js';
import ghecLastCommitCheck from '../api/compare/ghec-last-commit-check.js';

// Prompt for Personal Access Token
const promptForToken = (msg) => {
	return [
		{
			type: 'password',
			name: 'PAT',
			message: msg,
		},
	];
};

// Prompt for Git Host
const promptForGitHost = () => {
	return [
		{
			type: 'select',
			name: GIT_HOST,
			message: 'Select Git Host',
			choices: [
				{ title: 'GitHub', value: GITHUB_HOST },
				{ title: 'GitLab', value: GITLAB_HOST },
			],
		},
	];
}

/**
 * Sets the PAT if one was provided, otherwise prompts the user for one
 *
 * @param {string} PAT the Personal Access Token for the user
 * @param {object} options the information needed for the migration
 * @param {string} msg the prompt message for the user
 * @param {string} field the token field on use
 */
export const handleToken = async (PAT, options, msg, field) => {
	if (!options[field]) {
		if (PAT) return PAT;
		else {
			// If PAT not in .env AND no token provided as argument
			// Prompt user to enter PAT
			const input = await prompts(promptForToken(msg));
			return input.PAT;
		}
	}

	return options[field];
};

/**
 * Sets the gitHost if one was provided, otherwise prompts the user for one
 *
 * @param {object} options the information needed for the migration
 */
export const handleGitHost = async (options) => {
	if (!options[GIT_HOST]) {
		const input = await prompts(promptForGitHost());
		return input[GIT_HOST];
	}

	return options[GIT_HOST];
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

	if (service === ghecLastCommitCheck) {
		options[GIT_HOST] = await handleGitHost(options);
	}

	service(options);
};
