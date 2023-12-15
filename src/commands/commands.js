#!/usr/bin/env node

import prompts from 'prompts';
import {
	COMPARE_REPO_DIRECT_COLLABORATORS,
	COMPARE_TEAMS,
	GENERATE_GHES_MIGRATION_SCRIPT,
	GHES_VS_GHEC,
} from '../services/constants.js';

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

/**
 * Sets the GHES URL if one was provided, otherwise prompts the user for one
 *
 * @param {string} URL GHES URL
 * @param {object} options the information needed for the migration
 */
export const handleGithubUrl = async (URL, options) => {
	if (!options.githubUrl) {
		if (URL) return URL;
		else {
			const input = await prompts(promptForToken());
			return input.URL;
		}
	}

	return options.githubUrl;
};

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
 * Sets the users file if one was provided, otherwise prompts the user for one
 * @param {object} options the information needed for the migration
 */
export const handleUsersFile = async (options) => {
	if (!options.usersFile) {
		// If the users file is not provided as argument
		const input = await prompts(promptForUsersFile());
		return input.usersFile;
	}

	return options.usersFile;
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
			COMPARE_REPO_DIRECT_COLLABORATORS,
			COMPARE_TEAMS,
			GENERATE_GHES_MIGRATION_SCRIPT,
			GHES_VS_GHEC,
		].includes(service)
	)
		options.token = await handleToken(PAT, options, 'Enter PAT: ', 'token');

	if (service === GHES_VS_GHEC) {
		if (!options.ghecFile) {
			options.ghecToken = await handleToken(
				options.ghecToken,
				options,
				'Enter GHEC token: ',
				'ghecToken',
			);
		}

		if (!options.ghesFile) {
			options.ghesToken = await handleToken(
				options.ghesToken,
				options,
				'Enter GHES Token: ',
				'ghesToken',
			);
			options.githubUrl = await handleGithubUrl(options.githubUrl, options);
		}
	}

	service(options);
};
