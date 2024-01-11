import prompts from 'prompts';
import { GIT_HOST } from '../services/constants.js';
import {
	promptForToken,
	promptForGitHost,
	promptForInputFile,
	promptForOrg,
	promptForServerUrl,
	promptForUsername,
} from './prompts.js';

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

export const handleInputFile = async (options, field, msg) => {
	if (!options[field]) {
		const input = await prompts(promptForInputFile(msg));
		return input.inputFile;
	}

	return options[field];
};

export const handleOrg = async (options, field, msg) => {
	if (!options[field]) {
		const input = await prompts(promptForOrg(msg));
		return input.organization;
	}

	return options[field];
};

export const handleServerUrl = async (options) => {
	if (!options.serverUrl) {
		const input = await prompts(promptForServerUrl());
		return input.serverUrl;
	}

	return options.serverUrl;
};

export const handleUsername = async (options) => {
	if (!options.githubUser) {
		const input = await prompts(promptForUsername());
		return input.username;
	}

	return options.githubUser;
};
