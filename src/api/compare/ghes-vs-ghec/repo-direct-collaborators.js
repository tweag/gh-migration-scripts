import { getData, getStringifier } from '../../../services/utils.js';

const compareRepoDirectCollaborators = async (options) => {
	const {
		organization: org,
		ghecFile,
		ghesFile,
		outsideCollaboratorsFile,
		usersFile: ghecUsersFile,
	} = options;

	const inputStringifier = getStringifier(
		`${org}-repo-direct-collaborators-input.csv`,
		['repo', 'login', 'role'],
	);
	const removeStringifier = getStringifier(
		`${org}-repo-direct-collaborators-remove.csv`,
		['repo', 'login'],
	);
	const ghecCollaborators = await getData(ghecFile);
	const ghesCollaborators = await getData(ghesFile);
	let outsideCollaborators = [];
	let ghecUsers = [];

	if (outsideCollaboratorsFile) {
		const data = await getData(outsideCollaboratorsFile);
		outsideCollaborators = data.map((row) => row.login.toLowerCase());
	}

	if (ghecUsersFile) {
		const ghecUsersData = await getData(ghecUsersFile);
		ghecUsers = ghecUsersData.map((user) => user.login.toLowerCase());
	}

	for (const row of ghesCollaborators) {
		let { repo, login, role } = row;
		login = login.toLowerCase();

		if (ghecUsers.length === 0 || ghecUsers.includes(login)) {
			if (
				outsideCollaborators.length === 0 ||
				!outsideCollaborators.includes(login)
			) {
				const found = ghecCollaborators.find(
					(c) =>
						c.repo === repo &&
						c.login.toLowerCase() === login &&
						c.role === role,
				);

				if (!found) {
					inputStringifier.write({ repo, login, role });
				}
			}
		}
	}

	for (const row of ghecCollaborators) {
		let { repo, login, role } = row;
		login = login.toLowerCase();

		const found = ghesCollaborators.find(
			(c) =>
				c.repo === repo && c.login.toLowerCase() === login && c.role === role,
		);

		if (!found) {
			const nextFound = ghesCollaborators.find(
				(c) => c.repo === repo && c.login.toLowerCase() === login,
			);

			if (!nextFound) {
				removeStringifier.write({ repo, login });
			}
		}
	}

	inputStringifier.end();
	removeStringifier.end();
};

export default compareRepoDirectCollaborators;
