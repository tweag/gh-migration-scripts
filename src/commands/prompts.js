import { GIT_HOST, GITHUB_HOST, GITLAB_HOST } from '../services/constants.js';

// Prompt for Personal Access Token
export const promptForToken = (msg) => {
	return [
		{
			type: 'password',
			name: 'PAT',
			message: msg,
		},
	];
};

// Prompt for Git Host
export const promptForGitHost = () => {
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
};

export const promptForInputFile = (msg) => {
	return [
		{
			type: 'text',
			name: 'inputFile',
			message: msg,
		},
	];
};

// Prompt for org name
export const promptForOrg = (msg) => {
	return [
		{
			type: 'text',
			name: 'organization',
			message: msg,
		},
	];
};

// Prompt for server url
export const promptForServerUrl = () => {
	return [
		{
			type: 'text',
			name: 'serverUrl',
			message: 'Enter server url',
		},
	];
};

// Prompt for github username
export const promptForUsername = () => {
	return [
		{
			type: 'text',
			name: 'username',
			message: 'Enter GitHub username',
		},
	];
};
