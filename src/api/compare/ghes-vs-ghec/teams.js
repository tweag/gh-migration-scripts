import { getData, getStringifier } from '../../../services/utils.js';

export const compareTeams = async (options) => {
	const {
		organization: org,
		ghecFile,
		ghesFile,
		ghecUsersFile,
		outputFile,
	} = options;

	const outputFileName =
		(outputFile && outputFile.endsWith('.csv') && outputFile) ||
		`${org}-teams-comparison.csv`;
	const stringifier = getStringifier(outputFileName, [
		'team',
		'issue',
		'repo',
		'member',
	]);
	const repoPermissionStringifier = getStringifier(
		`${org}-repo-team-permission-input.csv`,
		['repo', 'team', 'permission'],
	);
	const memberRoleStringifier = getStringifier(
		`${org}-member-team-role-input.csv`,
		['member', 'team', 'role'],
	);
	const ghecTeams = await getData(ghecFile);
	const ghesTeams = await getData(ghesFile);
	let ghecUsers = [];

	if (ghecUsersFile) {
		const ghecUsersData = await getData(ghecUsersFile);
		ghecUsers = ghecUsersData.map((user) => user.login.toLowerCase());
	}

	const ghecTeamsLength = ghecTeams.length;
	const ghesTeamsLength = ghesTeams.length;

	if (ghecTeamsLength !== ghesTeamsLength) {
		console.log('Teams no. mismatch: ', ghecTeamsLength, ' ', ghesTeamsLength);
		console.log('GHES Teams Length: ', ghesTeamsLength);
		console.log('GHEC Teams Length: ', ghecTeamsLength);
	}

	for (const team of ghesTeams) {
		const {
			name,
			slug,
			members,
			membersCount,
			repositories,
			repositoriesCount,
		} = team;
		const repositoriesMapped = repositories
			.split(';')
			.map((repo) => repo.split(':'));
		const membersMapped = members.split(';').map((member) => member.split(':'));
		const found = ghecTeams.find((t) => t.slug == slug);

		if (!found) {
			console.log(`Team ${name} is missing ghec`);
			stringifier.write({ team: slug, issue: 'team-missing' });
		} else {
			if (
				name !== found.name ||
				team.description.trimEnd() !== found.description.trimEnd() ||
				team.privacy !== found.privacy ||
				team.childTeam !== found.childTeam ||
				team.parentTeam != found.parentTeam
			) {
				stringifier.write({ team: slug, issue: 'misconfigured' });
				console.log(`Team configuration mismatch for ${team.slug}`);
			}

			const {
				members: ghecMembers,
				membersCount: ghecMembersCount,
				repositories: ghecRepositories,
				repositoriesCount: ghecRepositoriesCount,
			} = found;

			const ghecRepositoriesMapped = ghecRepositories
				.split(';')
				.map((repo) => repo.split(':'));
			const ghecMembersMapped = ghecMembers
				.split(';')
				.map((member) => member.split(':'));

			if (repositoriesCount != ghecRepositoriesCount) {
				stringifier.write({ team: slug, issue: 'repositories-count-mismatch' });
				console.log(
					`Repositories count doesn't match for team ${slug}, ${repositoriesCount}  ${ghecRepositoriesCount}`,
				);
			}

			for (const repo of repositoriesMapped) {
				const repoFound = ghecRepositoriesMapped.find((c) => c[0] == repo[0]);

				if (!repoFound) {
					stringifier.write({
						team: slug,
						issue: 'repository-missing',
						repo: repo[0],
					});
					repoPermissionStringifier.write({
						repo: repo[0],
						team: slug,
						permission: repo[1],
					});
					console.log(`Repository ${repo[0]} missing on team ${slug}`);
				} else {
					// Repository permission check
					if (repo[1] != repoFound[1]) {
						stringifier.write({
							team: slug,
							issue: 'repository-permission-mismatch',
							repo: repo[0],
						});
						repoPermissionStringifier.write({
							repo: repo[0],
							team: slug,
							permission: repo[1],
						});
						console.log(
							`Repository ${repo[0]} permission for team ${slug} is wrong, ${repo[1]} ${repoFound[1]}`,
						);
					}
				}
			}

			if (membersCount != ghecMembersCount) {
				stringifier.write({ team: slug, issue: 'members-count-mismatch' });
				console.log(`Team ${slug} has members count mismatch`);
			}

			for (const member of membersMapped) {
				const memberFound = ghecMembersMapped.find(
					(c) => c[0].toLowerCase() == member[0].toLowerCase(),
				);

				if (!memberFound) {
					if (ghecUsers.includes(member[0])) {
						stringifier.write({
							team: slug,
							issue: 'member-missing',
							member: member[0],
						});
						memberRoleStringifier.write({
							member: member[0],
							team: slug,
							role: member[1],
						});
						console.log(`Member ${member[0]} missing on team ${slug}`);
					} else {
						stringifier.write({
							team: slug,
							issue: 'member-not-in-ghec',
							member: member[0],
						});
						console.log(`Member ${member[0]} missing on team ${slug}`);
					}
				} else {
					// Member permission check
					if (member[2] != memberFound[2]) {
						stringifier.write({
							team: slug,
							issue: 'member-permission-mismatch',
							member: member[0],
						});
						memberRoleStringifier.write({
							member: member[0],
							team: slug,
							role: member[1],
						});
						console.log(
							`Member ${member[0]} permission for team ${slug} is wrong, ${member[2]} ${memberFound[2]}}`,
						);
					}
				}
			}
		}
	}

	for (const ghecTeam of ghecTeams) {
		const found = ghesTeams.find((t) => t.slug === ghecTeam.slug);

		if (!found) {
			stringifier.write({ team: ghecTeam.slug, issue: 'extra-team' });
			console.log('Extra GHEC Team: ', ghecTeam.slug);
		}
	}

	memberRoleStringifier.end();
	repoPermissionStringifier.end();
	stringifier.end();
};
