#!/usr/bin/env node

import axios from 'axios';
import axiosRetry from 'axios-retry';
import fs from 'node:fs';
import csv from 'fast-csv';
import Ora from 'ora';
import { stringify } from 'csv-stringify';
import kebabCase from 'lodash.kebabcase';
import figlet from 'figlet';
import chalk from 'chalk';
import * as speak from './speak.js';

const spinner = Ora();

axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

export const makeRequest = async (config) => {
	try {
		const response = await axios.request(config);
		return response.data;
	} catch (error) {
		console.log(error);
	}
};

export const doRequest = async (config) => {
	try {
		const response = await axios.request(config);
		const { status, data } = response;

		return { status, data };
	} catch (error) {
		if (error.response) {
			const {
				status,
				statusText,
				data: { message },
			} = error.response;

			return {
				status,
				statusText,
				errorMessage: message,
			};
		} else {
			console.log(error);

			return {
				status: error.status || 500,
				statusText: error.message || 'Failed',
				errorMessage: error.message || 'Failed',
			};
		}
	}
};

export const getData = async (fileName) => {
	return new Promise((resolve, reject) => {
		try {
			const data = [];
			fs.createReadStream(fileName)
				.pipe(csv.parse({ headers: true }))
				.on('error', (error) => reject(error))
				.on('data', (row) => {
					data.push(row);
				})
				.on('end', () => {
					resolve(data);
				});
		} catch (error) {
			console.error(error);
		}
	});
};

export const getDate = () => {
	const currentDate = new Date();
	const day = currentDate.getDate().toString().padStart(2, '0');
	const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
	const year = currentDate.getFullYear();

	return `${day}-${month}-${year}`;
};

export const delay = (sec = 1) => {
	return new Promise((resolve) => {
		const delayMsg = '\ndelay: ' + sec + ' seconds\n';
		speak.warn(delayMsg);
		setTimeout(resolve, sec * 1000);
	});
};

export const getStringifier = (fileName, columns) => {
	const writableStream = fs.createWriteStream(fileName);
	const stringifier = stringify({ header: true, columns });
	stringifier.pipe(writableStream);

	return stringifier;
};

export const currentTime = () =>
	new Date()
		.toLocaleString()
		.replace(', ', '-')
		.replace(' ', '-')
		.replace(/\//g, ':');

export const showGraphQLErrors = (response) => {
	if (response.errorMessage) {
		spinner.fail(`${response.errorMessage}`);
		process.exit();
	}

	if (response.data && response.data.errors) {
		spinner.fail(`${response.data.errors[0].message}`);
		process.exit();
	}
};

export const getFunctionName = (func) => kebabCase(func.name);

export const showModusName = () => {
	console.log(chalk.bgWhiteBright.yellow(figlet.textSync('ModusCreate')));
};
