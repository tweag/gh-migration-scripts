# Project Name

[![MIT Licensed](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](./LICENSE)
[![Powered by Modus_Create](https://img.shields.io/badge/powered_by-Modus_Create-blue.svg?longCache=true&style=flat&logo=data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMzIwIDMwMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cGF0aCBkPSJNOTguODI0IDE0OS40OThjMCAxMi41Ny0yLjM1NiAyNC41ODItNi42MzcgMzUuNjM3LTQ5LjEtMjQuODEtODIuNzc1LTc1LjY5Mi04Mi43NzUtMTM0LjQ2IDAtMTcuNzgyIDMuMDkxLTM0LjgzOCA4Ljc0OS01MC42NzVhMTQ5LjUzNSAxNDkuNTM1IDAgMCAxIDQxLjEyNCAxMS4wNDYgMTA3Ljg3NyAxMDcuODc3IDAgMCAwLTcuNTIgMzkuNjI4YzAgMzYuODQyIDE4LjQyMyA2OS4zNiA0Ni41NDQgODguOTAzLjMyNiAzLjI2NS41MTUgNi41Ny41MTUgOS45MjF6TTY3LjgyIDE1LjAxOGM0OS4xIDI0LjgxMSA4Mi43NjggNzUuNzExIDgyLjc2OCAxMzQuNDggMCA4My4xNjgtNjcuNDIgMTUwLjU4OC0xNTAuNTg4IDE1MC41ODh2LTQyLjM1M2M1OS43NzggMCAxMDguMjM1LTQ4LjQ1OSAxMDguMjM1LTEwOC4yMzUgMC0zNi44NS0xOC40My02OS4zOC00Ni41NjItODguOTI3YTk5Ljk0OSA5OS45NDkgMCAwIDEtLjQ5Ny05Ljg5NyA5OC41MTIgOTguNTEyIDAgMCAxIDYuNjQ0LTM1LjY1NnptMTU1LjI5MiAxODIuNzE4YzE3LjczNyAzNS41NTggNTQuNDUgNTkuOTk3IDk2Ljg4OCA1OS45OTd2NDIuMzUzYy02MS45NTUgMC0xMTUuMTYyLTM3LjQyLTEzOC4yOC05MC44ODZhMTU4LjgxMSAxNTguODExIDAgMCAwIDQxLjM5Mi0xMS40NjR6bS0xMC4yNi02My41ODlhOTguMjMyIDk4LjIzMiAwIDAgMS00My40MjggMTQuODg5QzE2OS42NTQgNzIuMjI0IDIyNy4zOSA4Ljk1IDMwMS44NDUuMDAzYzQuNzAxIDEzLjE1MiA3LjU5MyAyNy4xNiA4LjQ1IDQxLjcxNC01MC4xMzMgNC40Ni05MC40MzMgNDMuMDgtOTcuNDQzIDkyLjQzem01NC4yNzgtNjguMTA1YzEyLjc5NC04LjEyNyAyNy41NjctMTMuNDA3IDQzLjQ1Mi0xNC45MTEtLjI0NyA4Mi45NTctNjcuNTY3IDE1MC4xMzItMTUwLjU4MiAxNTAuMTMyLTIuODQ2IDAtNS42NzMtLjA4OC04LjQ4LS4yNDNhMTU5LjM3OCAxNTkuMzc4IDAgMCAwIDguMTk4LTQyLjExOGMuMDk0IDAgLjE4Ny4wMDguMjgyLjAwOCA1NC41NTcgMCA5OS42NjUtNDAuMzczIDEwNy4xMy05Mi44Njh6IiBmaWxsPSIjRkZGIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz4KPC9zdmc+)](https://moduscreate.com)

Project description - one or two paragraphs. The enemy is dark and creates major problems. The solution is now available and the World can rejoice.

- [Getting Started](#getting-started)
- [How it Works](#how-it-works)
- [Developing](#developing)
  - [Prerequisites](#prerequisites)
  - [Testing](#testing)
  - [Contributing](#contributing)
- [Modus Create](#modus-create)
- [Licensing](#licensing)

# Getting Started

{Minimal steps required for a quick software trial.}

```js
import { Fantastico } from '@modus/awesome-solution';

const amazing = new Fantastico();

export default amazing;
```

# How it works

## GHES TO GHEC Migrations - WIP

## 1. Fetch repo metrics

### get-repos

#### Usage

Fetches all repositories of an organization

```
node src/index.js get-repos -o <organization>
```

#### Required Arguments

1. `-o` or `--organization` - Organization name.

#### Optional Arguments

1. `-a` or `--allow-untrusted-ssl-certificates` - Allow connections to a GitHub API endpoint that presents a SSL certificate that isn't issued by a trusted CA.
2. `-b` or `--batch-size` - Batch size for GraphQL request.
3. `-g` or `--github-url` - The target GHES server endpoint url, for eg. https://github.int.mcafee.com. If this argument is skipped then the target will be the cloud instance.
4. `-y` or `--output-file` - Output file to save the operation results. The default format is discussed below. Default file name is `<organization>-metrics/<organization>-repo-metrics-<date>-<target>.csv`.
   _date_ - Format is DD/MM/YYYY - The date is when the file is created
   _target_ - ghes or ghec
5. `-t` or `--token` - Personal access token - If not provided, then the user wil be prompted to input the token.
6. `-s` or `--skip` - Number of lines to skip in the input file. Default is set to 0.
7. `-u` or `--users-file` - File with user names so only those users will be considered. Should have the column name `login`.
8. `-w` or `--wait-time` - Delay time (in seconds) to wait between requests. Default value is 1 second.

#### Input

No input is required.

## 2. Export CSV of teams and membership from GHES

### get-teams

Fetches all teams of an organization along with repo team permissions and team memberships.

#### Usage

```
node src/index.js get-teams -o <organization>
```

#### Required Arguments

1. `-o` or `--organization` - Organization name.

#### Optional Arguments

1. `-a` or `--allow-untrusted-ssl-certificates` - Allow connections to a GitHub API endpoint that presents a SSL certificate that isn't issued by a trusted CA.
2. `-b` or `--batch-size` - Batch size for GraphQL request.
3. `-g` or `--github-url` - The target GHES server endpoint url, for eg. https://github.int.mcafee.com. If this argument is skipped then the target will be the cloud instance.
4. `-y` or `--output-file` - Output file to save the operation results. The default format is discussed below. The default file name is applicable only for the team metrics file.
5. `-t` or `--token` - Personal access token - If not provided, then the user wil be prompted to input the token.
6. `-s` or `--skip` - Number of lines to skip in the input file. Default is set to 0.
7. `-u` or `--users-file` - File with user names so only those users will be considered. Should have the column name `login`.
8. `-w` or `--wait-time` - Delay time (in seconds) to wait between requests. Default value is 1 second.

#### Input

No input is required.

#### Output

Three files are created as part of this operation.

a. **Teams metrics** - Contains the teams info.

**Format**

| name        | id  | slug        | combinedSlug    | description | privacy | url             | repositories         | repositoriesCount | childTeams | members                | membersCount | parentTeam       | parentTeamId | repositoriesUrl | repositoriesResourcePath            | resourcePath              | createdAt            | updatedAt            |
| ----------- | --- | ----------- | --------------- | ----------- | ------- | --------------- | -------------------- | ----------------- | ---------- | ---------------------- | ------------ | ---------------- | ------------ | --------------- | ----------------------------------- | ------------------------- | -------------------- | -------------------- |
| Sample Team | 123 | sample-team | org/sample-team | Desc        | closed  | https://url.com | repo-name:permission | 1                 | null       | abc:abc@email.com:role | 1            | parent-team-slug | 2            | https://url.com | /orgs/org/teams/owners/repositories | /orgs/mcafee/teams/owners | 2018-11-02T21:22:15Z | 2018-11-02T21:22:15Z |

Default file name is `<organization>-metrics/<organization>-team-metrics-<date>-<target>.csv`.
_date_ - Format is DD/MM/YYYY - The date is when the file is created
_target_ - ghes or ghec

b. **Team members** - File with members' roles of each team.

**Format**

| member   | team        | role       |
| -------- | ----------- | ---------- |
| abc-user | sample-team | MAINTAINER |

Default file name is `<organization>-metrics/<organization>-member-team-role-<date>-<target>.csv`.
_date_ - Format is DD/MM/YYYY - The date is when the file is created
_target_ - ghes or ghec
If a custom output file name is given, the team members file name will be `<custom-output-file>-member-team-role-<date>-<target>.csv`

c. **Team repositories** - File with repository permissions of each team.

**Format**

| repo        | team        | permission |
| ----------- | ----------- | ---------- |
| sample-repo | sample-team | WRITE      |

Default file name is `<organization>-metrics/<organization>-repo-team-permission-<date>-<target>.csv`.
_date_ - Format is DD/MM/YYYY - The date is when the file is created
_target_ - ghes or ghec
If a custom output file name is given, the team repos file name will be `<custom-output-file>-repo-team-permission-<date>-<target>.csv`

## 3. Export CSV of team permissions + direct members (org members outside teams) on repositories from GHES

Repo team permissions will be exported in the first step.

### get-repo-direct-collaborators

Fetches the direct collaborators of repositories in an organization.

#### Usage

```
node src/index.js get-repo-direct-collaborators -o <organization> -f <file>
```

#### Required Arguments

1. `-f` or `--file` - Input file with repository names.
2. `-o` or `--organization` - Organization name.

#### Optional Arguments

1. `c` or `--outside-collaborators-file` - Outside collaborators files to filter out the result. The api for repository directory collaborators returns outside collaborators as well. The CSV file should have a column with the name `login`.
2. `-g` or `--github-url` - The target GHES server endpoint url, for eg. https://github.int.mcafee.com. If this argument is skipped then the target will the cloud instance.
3. `-y` or `--output-file` - Output file to save the operation results. If not provided, the default file the results saved is `<organization>-repo-direct-collaborators-<timestamp>.csv`.
4. `-t` or `--token` - Personal access token - If not provided, then the user wil be prompted to input the token.
5. `-s` or `--skip` - Number of lines to skip in the input file. Default is set to 0.
6. `-u` or `--users-file` - File with user names so only those users will be considered. Should have the column name `login`.
7. `-w` or `--wait-time` - Delay time (in seconds) to wait between requests. Default value is 1 second.

#### Input

| repo     |
| -------- |
| abc-repo |

#### Output

Repositories direct collaborators role file (-y | --output-file)

| repo      | login     | role  |
| --------- | --------- | ----- |
| test-repo | test-user | admin |

Status file

| repo      | status  | statusText | errorMessage |
| --------- | ------- | ---------- | ------------ | --- |
| test-repo | Success |            |              |     |

## 4. Export CSV of outside collaborators in each organization

### get-outside-collaborators

Fetches outside collaborators of an organization.

#### Usage

```
node src/index.js get-outside-collaborators -o <organization>
```

#### Required Arguments

1. `-o` or `--organization` - Organization name.

#### Optional Arguments

1. `-g` or `--github-url` - The target GHES server endpoint url, for eg. https://github.int.mcafee.com. If this argument is skipped then the target will the cloud instance.
2. `-y` or `--output-file` - Output file to save the operation results. If not provided, the default file the results saved is `<organization>-outside-collaborators-<timestamp>.csv`.
3. `-t` or `--token` - Personal access token - If not provided, then the user wil be prompted to input the token.
4. `-u` or `--users-file` - File with user names so only those users will be considered. Should have the column name `login`.
5. `-w` or `--wait-time` - Delay time (in seconds) to wait between requests. Default value is 1 second.

#### Input

No input file is required

#### Output

| login         |
| ------------- |
| sample-user1  |
| samples-user2 |

## 5. Export CSV of users for this organization from GHES or GHEC

### get-enterprise-users

Fetches all users from all organizations.
For GHES, uses (if github-url is specified) - `'archive','cicd-terraform','Corp','labs','mcafee-content','mcafee',`
For GHEC, uses - `'mcafee-archive', 'mcafee-cicd-terraform', 'mcafee-corp', 'mcafee-content', 'mcafee-labs', 'mcafee-eng',`

#### Usage

```
node src/index.js get-enterprise-users
```

#### Optional Arguments

1. `-a` or `--allow-untrusted-ssl-certificates` - Allow connections to a GitHub API endpoint that presents a SSL certificate that isn't issued by a trusted CA.
2. `-b` or `--batch-size` - Batch size for GraphQL request.
3. `-e` or `--enterprise-organizations` - List of organizations on the enterprise. Organization names should be given space separated. E.g `-e archive labs mcafee-content`. It fetches users only from the passed organizations except for the default case. The default values are McAfee GHES organizations and McAFee GHEC organizations for GHES and GHEC targets respectively.
4. `-g` or `--github-url` - The target GHES server endpoint url, for eg. https://github.int.mcafee.com. If this argument is skipped then the target will the cloud instance.
5. `-y` or `--output-file` - Output file to save the operation results. If not provided, the default file the results saved is `enterprise-users-<timestamp>.csv`.
6. `-t` or `--token` - Personal access token - If not provided, then the user wil be prompted to input the token.
7. `-u` or `--users-file` - File with user names so only those users will be considered. Should have the column name `login`.
8. `-w` or `--wait-time` - Delay time (in seconds) to wait between requests. Default value is 1 second.

#### Input

No input file is required

#### Output

| login |
| ----- |
| user1 |
| user2 |

### get-org-users

Fetches users details in an organization.

#### Usage

```
node src/index.js get-org-users -o <organization-name>
```

#### Required Arguments

1. `-o` or `--organization` - Organization name.

#### Optional Arguments

1. `-a` or `--allow-untrusted-ssl-certificates` - Allow connections to a GitHub API endpoint that presents a SSL certificate that isn't issued by a trusted CA.
2. `-b` or `--batch-size` - Batch size for GraphQL request.
3. `-g` or `--github-url` - The target GHES server endpoint url, for eg. https://github.int.mcafee.com. If this argument is skipped then the target will the cloud instance.
4. `-y` or `--output-file` - Output file to save the operation results. If not provided, the default file the results saved is `<organization>-metrics/<organization>-user-metrics-13-11-2023-ghes.csv`. If the target is GHEC, then the end part of the file will be 'ghec' instead of 'ghes'. Moreover, the date part in the output file is `DD/MM/YYYY`.
5. `-t` or `--token` - Personal access token - If not provided, then the user wil be prompted to input the token.
6. `-u` or `--users-file` - File with user names so only those users will be considered. Should have the column name `login`.
7. `-w` or `--wait-time` - Delay time (in seconds) to wait between requests. Default value is 1 second.

#### Input

No input file is required

#### Output

| login        | name         | email              | role  | hasTwoFactorEnabled | id  | avatarUrl              | url             | websiteUrl              | isSiteAdmin | isViewer | projectsUrl              | projectsResourcePath            | createdAt            | updatedAt            |
| ------------ | ------------ | ------------------ | ----- | ------------------- | --- | ---------------------- | --------------- | ----------------------- | ----------- | -------- | ------------------------ | ------------------------------- | -------------------- | -------------------- |
| sample-login | Sample Login | sample-login@email | ADMIN | true                | 123 | https://avatar-url.com | https://url.com | https://website-url.com | false       | false    | https://projects-url.com | /orgs/org/teams/owners/projects | 2018-11-02T21:22:15Z | 2018-11-02T21:22:15Z |

## 6. Import teams and membership into GHEC

### create-teams

Create teams in an organization.

#### Usage

```
node src/index.js create-teams -o <organization> -f <file> -z <github-user>
```

#### Required Arguments

1. `-f` or `--file` - Input file name with teams info.
2. `-o` or `--organization` - Organization name.
3. `-z` or `--github-user` - GitHub username who is performing the operation, to delete the user after the team is created, because by default when a team is created, the user who created it will be added to the team.

#### Optional Arguments

1. `-g` or `--github-url` - The target GHES server endpoint url, for eg. https://github.int.mcafee.com. If this argument is skipped then the target will the cloud instance.
2. `-y` or `--output-file` - Output file to save the operation results. If not provided, the default file the results saved is `<organization>-create-teams-status-<timestamp>.csv`. The output file logs the names of the successfully migrated team names.
3. `-t` or `--token` - Personal access token - If not provided, then the user wil be prompted to input the token.
4. `-s` or `--skip` - Number of lines to skip in the input file. Default is set to 0.
5. `-w` or `--wait-time` - Delay time (in seconds) to wait between requests. Default value is 1 second.

#### Input

| name        | id  | slug        | combinedSlug    | description | privacy | url             | repositories         | repositoriesCount | childTeams | members                | membersCount | parentTeam       | parentTeamId | repositoriesUrl | repositoriesResourcePath            | resourcePath              | createdAt            | updatedAt            |
| ----------- | --- | ----------- | --------------- | ----------- | ------- | --------------- | -------------------- | ----------------- | ---------- | ---------------------- | ------------ | ---------------- | ------------ | --------------- | ----------------------------------- | ------------------------- | -------------------- | -------------------- |
| Sample Team | 123 | sample-team | org/sample-team | Desc        | closed  | https://url.com | repo-name:permission | 1                 | null       | abc:abc@email.com:role | 1            | parent-team-slug | 2            | https://url.com | /orgs/org/teams/owners/repositories | /orgs/mcafee/teams/owners | 2018-11-02T21:22:15Z | 2018-11-02T21:22:15Z |

Required fields in the input CSV file are:

1. name
2. description
3. privacy
4. parentTeam - Slug of the parent team
5. slug

To migrate the teams from GHES to GHEC, run **[get-teams](https://github.com/Modus-Sandbox/migration-tools#8-get-teams)** on GHES, get the output team metrics file and use it as input for this operation.

#### Output

| team   | status  | statusText | errorMessage |
| ------ | ------- | ---------- | ------------ | --- |
| team a | Success |            |              |
| team b | Success |            |              |     |

### insert-team-members

Inserts members to teams with the specified roles.

#### Usage

```
node src/index.js insert-team-members -o <organization> -f <file>
```

#### Required Arguments

1. `-f` or `--file` - Input file name with teams, member, and roles.
2. `-o` or `--organization` - Organization name.

#### Optional Arguments

1. `-g` or `--github-url` - The target GHES server endpoint url, for eg. https://github.int.mcafee.com. If this argument is skipped then the target will the cloud instance.
2. `-y` or `--output-file` - Output file to save the operation results. If not provided, the default file the results saved is `<organization>-insert-team-members-status-<timestamp>.csv`. The output files logs the successfully inserted teams members.
3. `-t` or `--token` - Personal access token - If not provided, then the user wil be prompted to input the token.
4. `-s` or `--skip` - Number of lines to skip in the input file. Default is set to 0.
5. `-w` or `--wait-time` - Delay time (in seconds) to wait between requests. Default value is 1 second.

#### Input

| member       | team        | role   |
| ------------ | ----------- | ------ |
| example-user | sample-team | MEMBER |

To migrate the team members from GHES to GHEC, use the team members output file of **[get-teams](https://github.com/Modus-Sandbox/migration-tools#8-get-teams)** operation.

#### Output

| member    | team      | role   | status  | statusText | errorMessage |
| --------- | --------- | ------ | ------- | ---------- | ------------ | --- |
| test-user | test-team | member | Success |            |              |     |

## 7. Add the outside collaborators to the organization as members

### set-membership-in-org

Adds or removes members from an organization.

#### Usage

```
node src/index.js set-membership-in-org -o <organization> -f <file>
```

#### Required Arguments

1. `-f` or `--file` - Input file name with member name.
2. `-o` or `--organization` - Organization name.

#### Optional Arguments

1. `-d` or `--delete-member` - Boolean flag. If set then it will remove the members from the organization.
2. `-g` or `--github-url` - The target GHES server endpoint url, for eg. https://github.int.mcafee.com. If this argument is skipped then the target will the cloud instance.
3. `-y` or `--output-file` - Output file to save the operation results. If not provided, the default file the results saved is `<organization>-set-membership-in-org-status-<timestamp>.csv`. The output files logs the successfully deleted organization members.
4. `-t` or `--token` - Personal access token - If not provided, then the user wil be prompted to input the token.
5. `-s` or `--skip` - Number of lines to skip in the input file. Default is set to 0.
6. `-w` or `--wait-time` - Delay time (in seconds) to wait between requests. Default value is 1 second.

#### Input

| login        |
| ------------ |
| example-user |

#### Output

| login        | status  | statusText | errorMessage |
| ------------ | ------- | ---------- | ------------ | --- |
| example-user | Success |            |              |     |

## 8. Export and Compare CSV of members, teams, membership from GHEC vs GHES

### compare-teams

Compares team metrics for GHES and GHEC for an organization.

#### Usage

```
node src/index.js compare-teams -c <ghec-file> -s <ghes-file> -o <organization>
```

#### Required Arguments

1. `-c` or `--ghec-file` - GHEC team metrics file.
2. `-s` or `--ghes-file` - GHES team metrics file.
3. `-o` or `--organization` - Organization name.

#### Optional Arguments

1. `-y` or `--output-file` - Output file to save the operation results. Default file names are discussed on the output section.
2. `-u` or `--users-file` - File with user names so only those users will be considered. Should have the column name `login`.

#### Input

| name        | id  | slug        | combinedSlug    | description | privacy | url             | repositories         | repositoriesCount | childTeams | members                | membersCount | parentTeam       | parentTeamId | repositoriesUrl | repositoriesResourcePath            | resourcePath              | createdAt            | updatedAt            |
| ----------- | --- | ----------- | --------------- | ----------- | ------- | --------------- | -------------------- | ----------------- | ---------- | ---------------------- | ------------ | ---------------- | ------------ | --------------- | ----------------------------------- | ------------------------- | -------------------- | -------------------- |
| Sample Team | 123 | sample-team | org/sample-team | Desc        | closed  | https://url.com | repo-name:permission | 1                 | null       | abc:abc@email.com:role | 1            | parent-team-slug | 2            | https://url.com | /orgs/org/teams/owners/repositories | /orgs/mcafee/teams/owners | 2018-11-02T21:22:15Z | 2018-11-02T21:22:15Z |

#### Output

Three files are generated as output files

a. **Comparison file** - Report of comparison of teams, members and repositories. Output file arguments overrides only this file.

Default file name - `<organization>-teams-comparison.csv`

Format

| team      | issue                       | repo | member |
| --------- | --------------------------- | ---- | ------ |
| test-team | repositories-count-mismatch |      |        |

b. **Repo permission file** - File with repositories teams permission mismatch that can be used as input to add repositories team permission.

Default file name - `<organization>-repo-team-permission-input.csv`

Format

| repo      | team      | permission |
| --------- | --------- | ---------- |
| test-repo | test-team | ADMIN      |

c. **Member role file** - File with members missing in teams as well as wrong permissions. It can be used to fix the mismatches as input for `insert-team-members` script.

Default file name - `<organization>-member-team-role-input.csv`

Format

| member | team      | role  |
| ------ | --------- | ----- |
| abc    | test-team | WRITE |

### compare-repo-direct-collaborators

Compares repo direct collaborators between GHES and GHEC in an organization.

#### Usage

```
node src/index.js compare-repo-direct-collaborators -c <ghec-file> -s <ghes-file> -o <organization>
```

#### Required Arguments

1. `-c` or `--ghec-file` - GHEC repo direct collaborators file.
2. `-s` or `--ghes-file` - GHES repo direct collaborators file.
3. `-o` or `--organization` - Organization name.

#### Optional Arguments

1. `-u` or `--users-file` - File with user names so only those users will be considered. Should have the column name `login`.
2. `z` or `--outside-collaborators-file` - File with outside collaborators names to not be included.

#### Input

| repo      | login | role  |
| --------- | ----- | ----- |
| test-repo | abc   | admin |

#### Output

Two files are generated as output files.

a. **Direct collaborators input file** - File with direct collaborators that need to be added to GHEC after comparison.

Default file name - `<organization>-repo-direct-collaborators-input.csv`

Format

| repo      | login | role  |
| --------- | ----- | ----- |
| test-repo | abc   | admin |

b. **Direct collaborators remove file** - File with input to remove collaborators permission. The collaborators permission might be outdated, so it is necessary to those permissions.

Default file name - `<organization>-repo-direct-collaborators-remove.csv`

Format

| repo      | login |
| --------- | ----- |
| test-repo | xyz   |

## 9. Set team permissions + direct members (organization members outside teams) on migrated repositories

### set-repo-collaborators

Adds or removes direct collaborators of repositories in an organization.

#### Usage

```
node src/index.js set-repo-collaborators -o <organization> -f <file>
```

#### Required Arguments

1. `-f` or `--file` - Input file name with repo, collaborators & roles info.
2. `-o` or `--organization` - Organization name.

#### Optional Arguments

1. `-g` or `--github-url` - The target GHES server endpoint url, for eg. https://github.int.mcafee.com. If this argument is skipped then the target will the cloud instance.
2. `-y` or `--output-file` - Output file to save the operation results. If not provided, the default file the results saved is `<organization>-set-repo-collaborators-status-<timestamp>.csv`. This output file logs the successful collaborators requests to repositories.
3. `-t` or `--token` - Personal access token - If not provided, then the user wil be prompted to input the token.
4. `-r` or `--repos-file` - File with repos names so only those repos will be considered. Should have the column `repos`.
5. `-s` or `--skip` - Number of lines to skip in the input file. Default is set to 0.
6. `-w` or `--wait-time` - Delay time (in seconds) to wait between requests. Default value is 1 second.

#### Input

| repo     | login       | role  |
| -------- | ----------- | ----- |
| abc-repo | sample-user | admin |

If the GHES repositories direct collaborators need to be imported to GHEC, then run **[get-repo-direct-collaborators](https://github.com/Modus-Sandbox/migration-tools#7-get-repo-direct-collaborators)** on GHES, use the output file as input file of this operation.

#### Output

| repo     | login       | role  | status  | statusText | errorMessage |
| -------- | ----------- | ----- | ------- | ---------- | ------------ |
| abc-repo | sample-user | admin | Success |            |              |

### set-repo-team-permission

Add teams with permissions to the repositories in an organization.

#### Usage

```
node src/index.js set-repo-team-permission -o <organization> -f <file>
```

#### Required Arguments

1. `-f` or `--file` - Input file name with repo, team & permission info.
2. `-o` or `--organization` - Organization name.

#### Optional Arguments

1. `-g` or `--github-url` - The target GHES server endpoint url, for eg. https://github.int.mcafee.com. If this argument is skipped then the target will the cloud instance.
2. `-y` or `--output-file` - Output file to save the operation results. If not provided, the default file the results saved is `<organization>-set-repo-team-permission-status-<timestamp>.csv`. This output file logs the successful teams permissions added to repositories.
3. `-t` or `--token` - Personal access token - If not provided, then the user wil be prompted to input the token.
4. `-r` or `--repos-file` - File with repos names so only those repos will be considered. Should have the column `repos`.
5. `-s` or `--skip` - Number of lines to skip in the input file. Default is set to 0.
6. `-w` or `--wait-time` - Delay time (in seconds) to wait between requests. Default value is 1 second.

#### Input

| repo     | team        | permission |
| -------- | ----------- | ---------- |
| abc-repo | sample-team | WRITE      |

To migrate teams permissions from GHES to GHEC, run **[get-teams](https://github.com/Modus-Sandbox/migration-tools#8-get-teams)**, use the repo teams permissions file as input.

## 10. Export team permissions from GHEC for the migrated repos

Use `get-teams` from step 1 on GHEC.

## 11. Compare CSVs repository - teams permissions between GHEC and GHES for consistency. (for the migrated repos)

Covered in [#7](https://github.com/Modus-Sandbox/migration-tools#7-export-and-compare-csv-of-members-teams-membership-from-ghec-vs-ghes)

## 12. Remove the outside collaborators

Use `set-membership-in-org` from step 6 with an additional flag `-d` or `--delete-members`.

**Note:**

All input and output files are CSV files.

#### Output

| repo     | team      | permission | status  | statusText | errorMessage |
| -------- | --------- | ---------- | ------- | ---------- | ------------ |
| abc-repo | test-team | write      | Success |            |              |

## Miscellaneous

### 1. set-archived-status

Archive or unarchive repositories in an organization.

#### Usage

```
node src/index.js set-archived-status -o <organization> -f <file>
```

#### Required Arguments

1. `-f` or `--file` - Input file name with repo, team & permission info.
2. `-o` or `--organization` - Organization name.

#### Optional Arguments

1. `-g` or `--github-url` - The target GHES server endpoint url, for eg. https://github.int.mcafee.com. If this argument is skipped then the target will the cloud instance.
2. `-y` or `--output-file` - Output file to save the operation results. If not provided, the default file the results saved is `<organization>-set-archived-status-<timestamp>.csv`. This output file logs the successful requests.
3. `-t` or `--token` - Personal access token - If not provided, then the user wil be prompted to input the token.
4. `-s` or `--skip` - Number of lines to skip in the input file. Default is set to 0.
5. `-u` or `--unarchive` - Boolean value, if set it will unarchive archived repos, if not set it will archive repos.
6. `-w` or `--wait-time` - Delay time (in seconds) to wait between requests. Default value is 1 second.

#### Input

| repo     |
| -------- |
| abc-repo |

#### Output

| repo     | status  | statusText | errorMessage |
| -------- | ------- | ---------- | ------------ | --- |
| abc-repo | Success |            |              |     |

### 2. delete-repos

Delete repositories in an organization.

#### Usage

```
node src/index.js delete-repos -o <organization> -f <file>
```

#### Required Arguments

1. `-f` or `--file` - Input file name with repository names to delete.
2. `-o` or `--organization` - Organization name.

#### Optional Arguments

1. `-g` or `--github-url` - The target GHES server endpoint url, for eg. https://github.int.mcafee.com. If this argument is skipped then the target will the cloud instance.
2. `-y` or `--output-file` - Output file to save the operation results. If not provided, the default file the results saved is `<organization>-delete-repos-status-<timestamp>.csv`. This output file logs the successful repositories deleted from the organization.
3. `-t` or `--token` - Personal access token - If not provided, then the user wil be prompted to input the token.
4. `-s` or `--skip` - Number of lines to skip in the input file. Default is set to 0.
5. `-w` or `--wait-time` - Delay time (in seconds) to wait between requests. Default value is 1 second.

#### Input

| repo     |
| -------- |
| abc-repo |

#### Output

| repo     | status  | statusText | errorMessage |
| -------- | ------- | ---------- | ------------ | --- |
| abc-repo | Success |            |              |     |

## Troubleshooting

If you run into any issues while executing the scripts, ensure your system meets the requirements listed in the documentation and that you've followed the installation steps correctly.

Below are the possible issues or errors that can happen.

### 1. Bad credentials

If a wrong token is provided, then you will get the bad credentials error.

GraphQL scripts error

![bad-credentials](https://github.com/Modus-Sandbox/migration-tools/assets/1175631/e8a8b79b-0350-49e2-be57-4416e7704c88)

REST API scripts error

![bad-credentials-2](https://github.com/Modus-Sandbox/migration-tools/assets/1175631/2b855204-bbf6-407b-9b95-60fa902935b4)

### 2. Wrong Command

If you mistype command name, then this error will happen.

![wrong-command](https://github.com/Modus-Sandbox/migration-tools/assets/1175631/2bee8f08-2db0-4504-8a41-f72feec3c487)

### 3. Server error

Sometimes the server connection can abruptly close which may be because of less time between consecutive requests. To avoid this issue, we can increase the time by increasing the wait/delay time. Default wait time is 1 second for all scripts where wait time is used. `-w` or `--wait-time` is the option to increase the delay.

![server-error](https://github.com/Modus-Sandbox/migration-tools/assets/1175631/c227dd9a-30db-4505-999c-e7932e70a314)

### 4. Validation failed

If we try to create an entity that is already created then we will get the validation failed error. For example, if we send a request to create a team which is an existing team, then this will be the error.

![validation-failed](https://github.com/Modus-Sandbox/migration-tools/assets/1175631/aaa7dc3b-0ef8-439e-9ed9-26290e2bb8b6)

### 5. 404 - Not found

If our request is to a non-existent entity, then we will get the 404 not found error.

![not-found](https://github.com/Modus-Sandbox/migration-tools/assets/1175631/1f55b409-114e-4b84-8738-cba51aae286b)

### 6. Archive

There are some archived repositories. We cannot make any post/put requests to these archived repositories. The scripts have already taken care of such issues by un-archiving first, then make the request, then archive. The error will be shown as part of log in the terminal and can be safely left.

But if this error occurred and the post request didn't succeed, it might be because of token. So, proceed by generating a new token with admin access.

![archive](https://github.com/Modus-Sandbox/migration-tools/assets/1175631/dc196031-762e-4729-93fc-3347f50db330)

# Developing

{Show how engineers can set up a development environment and contribute.}

## Prerequisites

{Explain the prerequisites}

## Testing

{Notes on testing}

## Contributing

See [Contribution Guidelines](.github/CONTRIBUTING.md) and [Code of Conduct](.github/CODE_OF_CONDUCT.md).

# Modus Create

{replace PROJECT_NAME in links below with the name of this project}

[Modus Create](https://moduscreate.com) is a digital product consultancy. We use a distributed team of the best talent in the world to offer a full suite of digital product design-build services; ranging from consumer facing apps, to digital migration, to agile development training, and business transformation.

<a href="https://moduscreate.com/?utm_source=labs&utm_medium=github&utm_campaign=PROJECT_NAME"><img src="https://res.cloudinary.com/modus-labs/image/upload/h_80/v1533109874/modus/logo-long-black.svg" height="80" alt="Modus Create"/></a>
<br />

This project is part of [Modus Labs](https://labs.moduscreate.com/?utm_source=labs&utm_medium=github&utm_campaign=PROJECT_NAME).

<a href="https://labs.moduscreate.com/?utm_source=labs&utm_medium=github&utm_campaign=PROJECT_NAME"><img src="https://res.cloudinary.com/modus-labs/image/upload/h_80/v1531492623/labs/logo-black.svg" height="80" alt="Modus Labs"/></a>

# Licensing

This project is [MIT licensed](./LICENSE).
