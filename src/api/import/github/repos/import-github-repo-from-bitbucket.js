#!/usr/bin/env node

import axios from 'axios';
import csv from 'fast-csv';
import fs from 'fs';
import path from 'path';
import { GITHUB_API_URL } from '../../../../services/constants.js';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

const createGitHubRepository = async (data) => {
	try {
		const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
		const response = await axios.post(`${GITHUB_API_URL}/user/repos`, data, {
			headers: {
				Accept: 'application/vnd.github+json',
				Authorization: `Bearer ${GITHUB_TOKEN}`,
			},
		});

		if (response.status === 201) {
			console.log('Repository created successfully!');
			return true;
		} else {
			console.log(`Received status code ${response.status}:`, response.data);
			return false;
		}
	} catch (error) {
		console.error(
			'Error creating repository:',
			error.response ? error.response.data : error.message,
		);
		return false;
	}
};

const createRepository = async (repoData) => {
	const { repoName, repoDescription, repoVisibility } = repoData;
	const isPrivate = repoVisibility === 'private';
	const data = {
		name: repoName,
		description: repoDescription,
		private: isPrivate,
		has_issues: true,
		has_projects: true,
		has_wiki: true,
	};

	console.log(`Creating the repository ${repoName}`);
	const wasCreated = await createGitHubRepository(data);

	if (wasCreated) {
		console.log(`Repository ${repoName} created successfully on GitHub side!`);
	} else {
		console.error(`Failed to create repository ${repoName}.`);
	}
};

const readRepositoryData = async (options) => {
	const csvFilePath = path.join(process.cwd(), options.inputFile);

	return new Promise((resolve, reject) => {
		const rows = [];
		const creationPromises = [];

		fs.createReadStream(csvFilePath)
			.pipe(csv.parse({ headers: true }))
			.on('data', (row) => {
				const repoData = {
					repoName: row.repo,
					repoDescription: row.description,
					repoUrl: row.url,
					repoVisibility: row.visibility,
				};

				const creationPromise = createRepository(repoData);
				creationPromises.push(creationPromise);

				rows.push(row);
			})
			.on('end', async () => {
				console.log('CSV file successfully processed');

				try {
					await Promise.all(creationPromises);
					resolve(rows);
				} catch (error) {
					reject(error);
				}
			})
			.on('error', (err) => {
				console.error('Error reading the CSV file:', err);
				reject(err);
			});
	});
};

const migrateRepository = async (repoData) => {
	const GITHUB_USERNAME = process.env.GITHUB_USERNAME;
	const { repoName, repoUrl } = repoData;
	const githubRepoUrl = `https://github.com/${GITHUB_USERNAME}/${repoName}.git`;
	const tempFolderPath = path.join(process.cwd(), 'tmp');
	const repoDir = path.join(tempFolderPath, repoName);

	try {
		if (!fs.existsSync(tempFolderPath)) {
			fs.mkdirSync(tempFolderPath, { recursive: true });
		}

		console.log(`Cloning repo ${repoName} from Bitbucket into ${repoDir}...`);
		await execPromise(`git clone --mirror ${repoUrl} ${repoDir}`);
		await execPromise(`git -C ${repoDir} remote add github ${githubRepoUrl}`);
		await execPromise(`git -C ${repoDir} push github --mirror`);

		fs.rmSync(repoDir, { recursive: true, force: true });

		console.log(`Repository ${repoName} migrated successfully.`);
	} catch (error) {
		console.error(`Error migrating repository ${repoName}:`, error.message);
	}
};

const migrateRepositoryData = async (options) => {
	const csvFilePath = path.join(process.cwd(), options.inputFile);
	const rows = [];

	return new Promise((resolve, reject) => {
		const readStream = fs.createReadStream(csvFilePath);
		const parser = csv.parse({ headers: true });
		readStream
			.pipe(parser)
			.on('data', (row) => {
				rows.push({
					repoName: row.repo,
					repoUrl: row.url,
				});
			})
			.on('end', async () => {
				console.log('CSV file successfully processed for migration!');

				for (const repoData of rows) {
					try {
						await migrateRepository(repoData);
					} catch (error) {
						console.error(
							`Error migrating repository ${repoData.repoName}:`,
							error.message,
						);
					}
				}

				resolve(rows);
			})
			.on('error', (err) => {
				console.error('Error reading the CSV file:', err);
				reject(err);
			});
	});
};

const importGithubRepoFromBitbucket = async (options) => {
	console.log('Starting the importing process...');
	try {
		await readRepositoryData(options);
		await migrateRepositoryData(options);
		console.log('Importing process done!');
	} catch (err) {
		console.error('Error during import:', err);
	}
};

export default importGithubRepoFromBitbucket;
