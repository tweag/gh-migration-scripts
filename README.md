# GitHub Migration Scripts

[![MIT Licensed](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](./LICENSE)
[![Powered by Modus_Create](https://img.shields.io/badge/powered_by-Modus_Create-blue.svg?longCache=true&style=flat&logo=data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMzIwIDMwMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cGF0aCBkPSJNOTguODI0IDE0OS40OThjMCAxMi41Ny0yLjM1NiAyNC41ODItNi42MzcgMzUuNjM3LTQ5LjEtMjQuODEtODIuNzc1LTc1LjY5Mi04Mi43NzUtMTM0LjQ2IDAtMTcuNzgyIDMuMDkxLTM0LjgzOCA4Ljc0OS01MC42NzVhMTQ5LjUzNSAxNDkuNTM1IDAgMCAxIDQxLjEyNCAxMS4wNDYgMTA3Ljg3NyAxMDcuODc3IDAgMCAwLTcuNTIgMzkuNjI4YzAgMzYuODQyIDE4LjQyMyA2OS4zNiA0Ni41NDQgODguOTAzLjMyNiAzLjI2NS41MTUgNi41Ny41MTUgOS45MjF6TTY3LjgyIDE1LjAxOGM0OS4xIDI0LjgxMSA4Mi43NjggNzUuNzExIDgyLjc2OCAxMzQuNDggMCA4My4xNjgtNjcuNDIgMTUwLjU4OC0xNTAuNTg4IDE1MC41ODh2LTQyLjM1M2M1OS43NzggMCAxMDguMjM1LTQ4LjQ1OSAxMDguMjM1LTEwOC4yMzUgMC0zNi44NS0xOC40My02OS4zOC00Ni41NjItODguOTI3YTk5Ljk0OSA5OS45NDkgMCAwIDEtLjQ5Ny05Ljg5NyA5OC41MTIgOTguNTEyIDAgMCAxIDYuNjQ0LTM1LjY1NnptMTU1LjI5MiAxODIuNzE4YzE3LjczNyAzNS41NTggNTQuNDUgNTkuOTk3IDk2Ljg4OCA1OS45OTd2NDIuMzUzYy02MS45NTUgMC0xMTUuMTYyLTM3LjQyLTEzOC4yOC05MC44ODZhMTU4LjgxMSAxNTguODExIDAgMCAwIDQxLjM5Mi0xMS40NjR6bS0xMC4yNi02My41ODlhOTguMjMyIDk4LjIzMiAwIDAgMS00My40MjggMTQuODg5QzE2OS42NTQgNzIuMjI0IDIyNy4zOSA4Ljk1IDMwMS44NDUuMDAzYzQuNzAxIDEzLjE1MiA3LjU5MyAyNy4xNiA4LjQ1IDQxLjcxNC01MC4xMzMgNC40Ni05MC40MzMgNDMuMDgtOTcuNDQzIDkyLjQzem01NC4yNzgtNjguMTA1YzEyLjc5NC04LjEyNyAyNy41NjctMTMuNDA3IDQzLjQ1Mi0xNC45MTEtLjI0NyA4Mi45NTctNjcuNTY3IDE1MC4xMzItMTUwLjU4MiAxNTAuMTMyLTIuODQ2IDAtNS42NzMtLjA4OC04LjQ4LS4yNDNhMTU5LjM3OCAxNTkuMzc4IDAgMCAwIDguMTk4LTQyLjExOGMuMDk0IDAgLjE4Ny4wMDguMjgyLjAwOCA1NC41NTcgMCA5OS42NjUtNDAuMzczIDEwNy4xMy05Mi44Njh6IiBmaWxsPSIjRkZGIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz4KPC9zdmc+)](https://moduscreate.com)

Hey there! 👋 Welcome to our migration tools repository – your go-to toolkit for seamlessly transferring repos and metadata from GitHub Enterprise Server, Bitbucket, and more to GitHub Enterprise Cloud. 🌐✨ Whether you're switching platforms or consolidating your projects, our collection of utilities is here to make your migration journey smooth and stress-free.

- [Getting Started](#getting-started)
- [How it Works](#how-it-works)
- [Developing](#developing)
  - [Prerequisites](#prerequisites)
  - [Testing](#testing)
  - [Contributing](#contributing)
- [Modus Create](#modus-create)
- [Licensing](#licensing)

# Getting Started

1. Clone the repo: git clone https://github.com/ModusCreateOrg/gh-migration-scripts.git
2. Navigate to the tools directory: `cd gh-migration-scripts`
3. Run `npm install -g`
4. Follow our detailed documentation for step-by-step instructions on using each tool.

# Supported Features

## Export

| Features                                    | GHES                                                                                                                                                                                                                                                                 | Bitbucket Server                                                                                                                                                      | GitLab                                                                                                                                                          |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Export repositories                      | ✅ [export-github-repos](https://github.com/ModusCreateOrg/gh-migration-scripts?tab=readme-ov-file#export-github-repos)                                                                                                                                              | ✅ [export-bitbucket-repositories](https://github.com/ModusCreateOrg/gh-migration-scripts?tab=readme-ov-file#export-bitbucket-repositories)                           | ✅ [export-gitlab-repositories](https://github.com/ModusCreateOrg/gh-migration-scripts?tab=readme-ov-file#export-gitlab-repositories)                           |
| 2. Export repositories members              | ✅ [export-github-repo-direct-collaborators](https://github.com/ModusCreateOrg/gh-migration-scripts?tab=readme-ov-file#export-github-repo-direct-collaborators)                                                                                                      | ✅ [export-bitbucket-repo-direct-collaborators](https://github.com/ModusCreateOrg/gh-migration-scripts?tab=readme-ov-file#export-bitbucket-repo-direct-collaborators) | ✅ [export-gitlab-repo-direct-collaborators](https://github.com/ModusCreateOrg/gh-migration-scripts?tab=readme-ov-file#export-gitlab-repo-direct-collaborators) |
| 3. Export teams                             | ✅ [export-github-teams-and-permissions](https://github.com/ModusCreateOrg/gh-migration-scripts?tab=readme-ov-file#export-github-teams-and-permissions)                                                                                                              | ✅ [export-bitbucket-teams](https://github.com/ModusCreateOrg/gh-migration-scripts?tab=readme-ov-file#export-bitbucket-teams)                                         | ✅ [export-gitlab-teams](https://github.com/ModusCreateOrg/gh-migration-scripts?tab=readme-ov-file#export-gitlab-teams)                                         |
| 4. Export team members                      | ✅ [export-github-teams-and-permissions](https://github.com/ModusCreateOrg/gh-migration-scripts?tab=readme-ov-file#export-github-teams-and-permissions)                                                                                                              | ✅ [export-bitbucket-team-members](https://github.com/ModusCreateOrg/gh-migration-scripts?tab=readme-ov-file#export-bitbucket-team-members)                           | ✅ [export-gitlab-team-members](https://github.com/ModusCreateOrg/gh-migration-scripts?tab=readme-ov-file#export-gitlab-team-members)                           |
| 5. Export team repositories permission      | ✅ [export-bitbucket-team-members](https://github.com/ModusCreateOrg/gh-migration-scripts?tab=readme-ov-file#export-bitbucket-team-members)                                                                                                                          | ✅ [export-bitbucket-repo-team-permissions](https://github.com/ModusCreateOrg/gh-migration-scripts?tab=readme-ov-file#export-bitbucket-repo-team-permissions)         | ✅ [export-gitlab-team-members](https://github.com/ModusCreateOrg/gh-migration-scripts?tab=readme-ov-file#export-gitlab-team-members)                           |
| 6. Export organization users                | ✅ [export-github-org-users](https://github.com/ModusCreateOrg/gh-migration-scripts?tab=readme-ov-file#export-github-org-users)                                                                                                                                      | ✅ [export-bitbucket-project-users](https://github.com/ModusCreateOrg/gh-migration-scripts?tab=readme-ov-file#export-bitbucket-project-users)                         | ❌                                                                                                                                                              |
| 7. Export enterprise users                  | ✅ [export-github-enterprise-users](https://github.com/ModusCreateOrg/gh-migration-scripts?tab=readme-ov-file#export-github-enterprise-users)                                                                                                                        | ✅ [export-bitbucket-enterprise-users](https://github.com/ModusCreateOrg/gh-migration-scripts?tab=readme-ov-file#export-bitbucket-enterprise-users)                   | ✅ [export-gitlab-users](https://github.com/ModusCreateOrg/gh-migration-scripts?tab=readme-ov-file#export-gitlab-users)                                         |
| 8. Export organization projects             | ✅ [export-github-projects-v1](https://github.com/ModusCreateOrg/gh-migration-scripts?tab=readme-ov-file#export-github-projects-v1) [export-github-projects-v2](https://github.com/ModusCreateOrg/gh-migration-scripts?tab=readme-ov-file#export-github-projects-v2) | ❌                                                                                                                                                                    | ❌                                                                                                                                                              |
| 9. Check repositories last commits          | ✅ [ghec-last-commit-check](https://github.com/ModusCreateOrg/gh-migration-scripts?tab=readme-ov-file#ghec-last-commit-check)                                                                                                                                        | ❌                                                                                                                                                                    | ❌                                                                                                                                                              |
| 10. Delete repositories                     | ✅ [delete-github-repos](https://github.com/ModusCreateOrg/gh-migration-scripts?tab=readme-ov-file#2-delete-github-repos)                                                                                                                                            | ❌                                                                                                                                                                    | ❌                                                                                                                                                              |
| 11. Export outside collaborators            | ✅ [export-github-outside-collaborators](https://github.com/ModusCreateOrg/gh-migration-scripts?tab=readme-ov-file#3-export-github-outside-collaborators)                                                                                                            | ❌                                                                                                                                                                    | ❌                                                                                                                                                              |
| 12. Export List Of Github Actions In A Repo | Todo                                                                                                                                                                                                                                                                 | ❌                                                                                                                                                                    | ❌                                                                                                                                                              |
| 13. Export List Of Github Actions In An Org | Todo                                                                                                                                                                                                                                                                 | ❌                                                                                                                                                                    | ❌                                                                                                                                                              |
| 14. Export Branches Of A Repo               | Todo                                                                                                                                                                                                                                                                 | Todo                                                                                                                                                                  | Todo                                                                                                                                                            |
| 15. Export Dependencies In A Repo           | Todo                                                                                                                                                                                                                                                                 | ❌                                                                                                                                                                    | ❌                                                                                                                                                              |
| 16. Export Settings Of An Enterrpise        | Todo                                                                                                                                                                                                                                                                 | ❌                                                                                                                                                                    | ❌                                                                                                                                                              |

## Import

| Features                                  | GHEC                                                                                                                                                  |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Import repository direct collaborators | ✅ [import-github-repo-collaborators](https://github.com/ModusCreateOrg/gh-migration-scripts?tab=readme-ov-file#import-github-repo-collaborators)     |
| 2. Import repository team permissions     | ✅ [import-github-repo-team-permission](https://github.com/ModusCreateOrg/gh-migration-scripts?tab=readme-ov-file#import-github-repo-team-permission) |
| 3. Import teams                           | ✅ [import-github-teams](https://github.com/ModusCreateOrg/gh-migration-scripts?tab=readme-ov-file#import-github-teams)                               |
| 4. Import team members                    | ✅ [import-github-team-members](https://github.com/ModusCreateOrg/gh-migration-scripts?tab=readme-ov-file#import-github-team-members)                 |
| 5. Archive/unarchive repositories         | ✅ [set-github-archived-status](https://github.com/ModusCreateOrg/gh-migration-scripts?tab=readme-ov-file#1-set-github-archived-status)               |
| 6. Delete repositories                    | ✅ [delete-github-repos](https://github.com/ModusCreateOrg/gh-migration-scripts?tab=readme-ov-file#2-delete-github-repos)                             |
| 7. Import organization memberships        | ✅ [import-github-membership-in-org](https://github.com/ModusCreateOrg/gh-migration-scripts?tab=readme-ov-file#import-github-membership-in-org)       |
| 8. Import organization projects           | ✅ [import-github-projects-v2](https://github.com/ModusCreateOrg/gh-migration-scripts?tab=readme-ov-file#import-github-projects-v2)                   |

# How it works

## Export

### A. GitHub Enterprise Server - GHES

### 1. Export Github Repositories

#### export-github-repos

#### Usage

Exports all repositories of a github organization

```
git-migrator export-github-repos
```

#### Arguments

1. `-o` or `--organization` - Organization name.
2. `-a` or `--allow-untrusted-ssl-certificates` - Allow connections to a GitHub API endpoint that presents a SSL certificate that isn't issued by a trusted CA.
3. `-b` or `--batch-size` - Batch size for GraphQL request.
4. `-g` or `--server-url` - The target GHES server endpoint url. If this argument is skipped then the target will be the cloud instance.
5. `-y` or `--output-file` - Output file to save the operation results. The default format is discussed below. Default file name is `<organization>-metrics/<organization>-repo-metrics-<date>-<target>.csv`.
   _date_ - Format is DD/MM/YYYY - The date is when the file is created
   _target_ - ghes or ghec
6. `-t` or `--token` - Personal access token.
7. `-s` or `--skip` - Number of lines to skip in the input file. Default is set to 0.
8. `-u` or `--users-file` - File with user names so only those users will be considered. Should have the column name `login`.
9. `-w` or `--wait-time` - Delay time (in seconds) to wait between requests. Default value is 1 second.

#### Input

No input is required.

### 2. Export Github Direct Repository collaborators

Repo team permissions will be exported in the first step.

#### export-github-repo-direct-collaborators

Exports the direct collaborators of repositories in a github organization.

#### Usage

```
git-migrator export-github-repo-direct-collaborators
```

#### Arguments

1. `-f` or `--input-file` - Input file with repository names.
2. `-o` or `--organization` - Organization name.
3. `c` or `--outside-collaborators-file` - Outside collaborators files to filter out the result. The api for repository directory collaborators returns outside collaborators as well. The CSV file should have a column with the name `login`.
4. `-g` or `--server-url` - The target GHES server endpoint url. If this argument is skipped then the target will the cloud instance.
5. `-y` or `--output-file` - Output file to save the operation results. If not provided, the default file the results saved is `<organization>-repo-direct-collaborators-<timestamp>.csv`.
6. `-t` or `--token` - Personal access token.
7. `-s` or `--skip` - Number of lines to skip in the input file. Default is set to 0.
8. `-u` or `--users-file` - File with user names so only those users will be considered. Should have the column name `login`.
9. `-w` or `--wait-time` - Delay time (in seconds) to wait between requests. Default value is 1 second.

#### Input

| repo     |
| -------- |
| abc-repo |

#### Output

Repositories direct collaborators role file (-y | --output-file)

| repo      | login     | role  |
| --------- | --------- | ----- |
| test-repo | test-user | admin |

**Status file**

| repo      | status  | statusText | errorMessage |
| --------- | ------- | ---------- | ------------ |
| test-repo | Success |            |              |

### 3a. Export Github Teams In An Organization

### 3b. Export Github Team Members

### 3c. Export Github Repository Team Permission

All the above 3 actions are done by the below `export-github-teams-and-permissions` script.

#### export-github-teams-and-permissions

Exports all teams of an organization along with team memberships and repo team permissions.

#### Usage

```
git-migrator export-github-teams-and-permissions
```

#### Arguments

1. `-o` or `--organization` - Organization name.
2. `-a` or `--allow-untrusted-ssl-certificates` - Allow connections to a GitHub API endpoint that presents a SSL certificate that isn't issued by a trusted CA.
3. `-b` or `--batch-size` - Batch size for GraphQL request.
4. `-g` or `--server-url` - The target GHES server endpoint url. If this argument is skipped then the target will be the cloud instance.
5. `-y` or `--output-file` - Output file to save the operation results. The default format is discussed below. The default file name is applicable only for the team metrics file.
6. `-t` or `--token` - Personal access token.
7. `-s` or `--skip` - Number of lines to skip in the input file. Default is set to 0.
8. `-u` or `--users-file` - File with user names so only those users will be considered. Should have the column name `login`.
9. `-w` or `--wait-time` - Delay time (in seconds) to wait between requests. Default value is 1 second.

#### Input

No input is required.

#### Output

Three files are created as part of this operation.

a. **Teams metrics** - Contains the teams info.

**Format**

| name        | id  | slug        | combinedSlug    | description | privacy | url             | repositories         | repositoriesCount | childTeams | members                | membersCount | parentTeam       | parentTeamId | repositoriesUrl | repositoriesResourcePath            | resourcePath           | createdAt            | updatedAt            |
| ----------- | --- | ----------- | --------------- | ----------- | ------- | --------------- | -------------------- | ----------------- | ---------- | ---------------------- | ------------ | ---------------- | ------------ | --------------- | ----------------------------------- | ---------------------- | -------------------- | -------------------- |
| Sample Team | 123 | sample-team | org/sample-team | Desc        | closed  | https://url.com | repo-name:permission | 1                 | null       | abc:abc@email.com:role | 1            | parent-team-slug | 2            | https://url.com | /orgs/org/teams/owners/repositories | /orgs/org/teams/owners | 2018-11-02T21:22:15Z | 2018-11-02T21:22:15Z |

Default file name is `<organization>-metrics/<organization>-team-metrics-<date>-<target>.csv`.
_date_ - Format is DD/MM/YYYY - The date is when the file is created
_target_ - ghes or ghec

b. **Team members** - File with members' roles of each team.

**Format**

| member   | team        | role       |
| -------- | ----------- | ---------- |
| abc-user | sample-team | maintainer |

Default file name is `<organization>-metrics/<organization>-member-team-role-<date>-<target>.csv`.
_date_ - Format is DD/MM/YYYY - The date is when the file is created
_target_ - ghes or ghec
If a custom output file name is given, the team members file name will be `<custom-output-file>-member-team-role-<date>-<target>.csv`

c. **Team repositories** - File with repository permissions of each team.

**Format**

| repo        | team        | permission |
| ----------- | ----------- | ---------- |
| sample-repo | sample-team | write      |

Default file name is `<organization>-metrics/<organization>-repo-team-permission-<date>-<target>.csv`.
_date_ - Format is DD/MM/YYYY - The date is when the file is created
_target_ - ghes or ghec
If a custom output file name is given, the team repos file name will be `<custom-output-file>-repo-team-permission-<date>-<target>.csv`.

### 4. Export Github Enterprise Users

#### export-github-enterprise-users

Exports all users from all github organizations on the enterprise server.

#### Usage

```
git-migrator export-github-enterprise-users
```

#### Arguments

1. `-a` or `--allow-untrusted-ssl-certificates` - Allow connections to a GitHub API endpoint that presents a SSL certificate that isn't issued by a trusted CA.
2. `-b` or `--batch-size` - Batch size for GraphQL request.
3. `-e` or `--enterprise-organizations` - List of organizations on the enterprise. Organization names should be given space separated. E.g `-e org1 org2 org3`.
4. `-g` or `--server-url` - The target GHES server endpoint url. If this argument is skipped then the target will the cloud instance.
5. `-y` or `--output-file` - Output file to save the operation results. If not provided, the default file the results saved is `enterprise-users-<timestamp>.csv`.
6. `-t` or `--token` - Personal access token.
7. `-u` or `--users-file` - File with user names so only those users will be considered. Should have the column name `login`.
8. `-w` or `--wait-time` - Delay time (in seconds) to wait between requests. Default value is 1 second.

#### Input

No input file is required

#### Output

| login |
| ----- |
| user1 |
| user2 |

### 5. Export Github Organization Users

#### export-github-org-users

Exports users details in an organization.

#### Usage

```
git-migrator export-github-org-users
```

#### Arguments

1. `-o` or `--organization` - Organization name.
2. `-a` or `--allow-untrusted-ssl-certificates` - Allow connections to a GitHub API endpoint that presents a SSL certificate that isn't issued by a trusted CA.
3. `-b` or `--batch-size` - Batch size for GraphQL request.
4. `-g` or `--server-url` - The target GHES server endpoint url. If this argument is skipped then the target will the cloud instance.
5. `-y` or `--output-file` - Output file to save the operation results. If not provided, the default file the results saved is `<organization>-metrics/<organization>-user-metrics-13-11-2023-ghes.csv`. If the target is GHEC, then the end part of the file will be 'ghec' instead of 'ghes'. Moreover, the date part in the output file is `DD/MM/YYYY`.
6. `-t` or `--token` - Personal access token.
7. `-u` or `--users-file` - File with user names so only those users will be considered. Should have the column name `login`.
8. `-w` or `--wait-time` - Delay time (in seconds) to wait between requests. Default value is 1 second.

#### Input

No input file is required

#### Output

| login        | name         | email              | role  | hasTwoFactorEnabled | id  | avatarUrl              | url             | websiteUrl              | isSiteAdmin | isViewer | projectsUrl              | projectsResourcePath            | createdAt            | updatedAt            |
| ------------ | ------------ | ------------------ | ----- | ------------------- | --- | ---------------------- | --------------- | ----------------------- | ----------- | -------- | ------------------------ | ------------------------------- | -------------------- | -------------------- |
| sample-login | Sample Login | sample-login@email | admin | true                | 123 | https://avatar-url.com | https://url.com | https://website-url.com | false       | false    | https://projects-url.com | /orgs/org/teams/owners/projects | 2018-11-02T21:22:15Z | 2018-11-02T21:22:15Z |

### 6. Export Github Projects V1

#### export-github-projects-v1

Exports all V1 projects of a github organization.

#### Usage

```
git-migrator export-github-projects-v1
```

#### Arguments

1. `-o` or `--organization` - Organization name.
2. `-a` or `--allow-untrusted-ssl-certificates` - Allow connections to a GitHub API endpoint that presents a SSL certificate that isn't issued by a trusted CA.
3. `-b` or `--batch-size` - Batch size for GraphQL request.
4. `-g` or `--server-url` - The target GHES server endpoint url. If this argument is skipped then the target will the cloud instance.
5. `-y` or `--output-file` - Output file to save the operation results. If not provided, the default file the results saved is `<organization>-metrics/<organization>-projects-v2-ghes-<date-time>.csv`. If the target is GHEC, then the end part of the file will be 'ghec' instead of 'ghes'.
6. `-t` or `--token` - Personal access token.
7. `-w` or `--wait-time` - Delay time (in seconds) to wait between requests. Default value is 1 second.

#### Input

No input file is required

#### Output

Output is a JSON file with projects info.

### 7. Export Github Projects V2

#### export-github-projects-v2

Exports all V2 projects of a igthub organization.

#### Usage

```
git-migrator export-github-projects-v2
```

#### Arguments

1. `-o` or `--organization` - Organization name.
2. `-a` or `--allow-untrusted-ssl-certificates` - Allow connections to a GitHub API endpoint that presents a SSL certificate that isn't issued by a trusted CA.
3. `-b` or `--batch-size` - Batch size for GraphQL request.
4. `-g` or `--server-url` - The target GHES server endpoint url. If this argument is skipped then the target will the cloud instance.
5. `-y` or `--output-file` - Output file to save the operation results. If not provided, the default file the results saved is `<organization>-metrics/<organization>-projects-v2-ghes-<date-time>.csv`. If the target is GHEC, then the end part of the file will be 'ghec' instead of 'ghes'.
6. `-t` or `--token` - Personal access token.
7. `-w` or `--wait-time` - Delay time (in seconds) to wait between requests. Default value is 1 second.

#### Input

No input file is required

#### Output

Output is a JSON file with projects info.

### 8. Import Github Projects V2

#### import-github-projects-v2

Creates V2 projects in an organization.

#### Usage

```
git-migrator import-github-projects-v2
```

#### Arguments

1. `-o` or `--organization` - Organization name.
2. `-f` or `--input-file` - Input file with projects v2 info.
3. `-a` or `--allow-untrusted-ssl-certificates` - Allow connections to a GitHub API endpoint that presents a SSL certificate that isn't issued by a trusted CA.
4. `-b` or `--batch-size` - Batch size for GraphQL request.
5. `-g` or `--server-url` - The target GHES server endpoint url. If this argument is skipped then the target will the cloud instance.
6. `-y` or `--output-file` - Output file to save the operation results. If not provided, the default file the results saved is `<organization>-metrics/<organization>-create-projects-v2-ghes-<date-time>.csv`. If the target is GHEC, then the end part of the file will be 'ghec' instead of 'ghes'.
7. `-t` or `--token` - Personal access token.
8. `-w` or `--wait-time` - Delay time (in seconds) to wait between requests. Default value is 1 second.

#### Input

No input file is required

#### Output

Output is a JSON file with projects info.

### B. Bitbucket

### 1. Export Bitbucket Repo Team Permissions

#### export-bitbucket-repo-team-permissions

Exports team permissions of all repositories of a bitbucket project.

#### Usage

```
git-migrator export-bitbucket-repo-team-permissions
```

#### Arguments

1. `-o` or `--organization` - Organization name.
2. `-f` or `--input-file` - Input file name with repo name.
3. `-b` or `--batch-size` - Batch size for requests.
4. `-g` or `--server-url` - The bitbucket server URL.
5. `-y` or `--output-file` - Output file to save the operation results. If not provided, the default file the results saved is `<organization>-bitbucket-repo-teams-permissions-<date-time>.csv`.
6. `-t` or `--token` - Personal access token.
7. `-w` or `--wait-time` - Delay time (in seconds) to wait between requests. Default value is 1 second.

#### Input

| repo        |
| ----------- |
| sample-repo |

#### Output

| repo        | team        | permission |
| ----------- | ----------- | ---------- |
| sample-repo | sample-team | write      |

### 2. Export Bitbucket Repositories

#### export-bitbucket-repos

Exports all repositories of a bitbucket organization (workspace).

#### Usage

```
git-migrator export-bitbucket-repos
```

#### Arguments

1. `-o` or `--organization` - Organization name.
2. `-b` or `--batch-size` - Batch size for requests.
3. `-g` or `--server-url` - The bitbucket server URL.
4. `-y` or `--output-file` - Output file to save the operation results. If not provided, the default file the results saved is `<organization>-bitbucket-repo-<date-time>.csv`.
5. `-t` or `--token` - Personal access token.
6. `-w` or `--wait-time` - Delay time (in seconds) to wait between requests. Default value is 1 second.

#### Input

No input is required

#### Output

| repo        |
| ----------- |
| sample-repo |

### 3. Export Bitbucket Repo Direct Collaborators

#### export-bitbucket-repo-direct-collaborators

Exports users permissions of all repositories of a bitbucket organization (workspace).

#### Usage

```
git-migrator export-bitbucket-repo-direct-collaborators
```

#### Arguments

1. `-o` or `--organization` - Organization name.
2. `-f` or `--input-file` - Input file name with repo names.
3. `-b` or `--batch-size` - Batch size for requests.
4. `-g` or `--server-url` - The bitbucket server URL.
5. `-y` or `--output-file` - Output file to save the operation results. If not provided, the default file the results saved is `<organization>-bitbucket-repo-direct-collaborators-<date-time>.csv`.
6. `-t` or `--token` - Personal access token.
7. `-w` or `--wait-time` - Delay time (in seconds) to wait between requests. Default value is 1 second.

#### Input

| repo        |
| ----------- |
| sample-repo |

#### Output

| repo        | login     | role  |
| ----------- | --------- | ----- |
| sample-repo | test-user | write |

### 4. Export Bitbucket Teams

#### export-bitbucket-teams

Exports all teams of a Bitbucket project.

#### Usage

```
git-migrator export-bitbucket-teams
```

#### Arguments

1. `-o` or `--organization` - Organization name.
2. `-b` or `--batch-size` - Batch size for requests.
3. `-g` or `--server-url` - The bitbucket server URL.
4. `-y` or `--output-file` - Output file to save the operation results. If not provided, the default file the results saved is `<organization>-bitbucket-teams-<date-time>.csv`.
5. `-t` or `--token` - Personal access token.
6. `-w` or `--wait-time` - Delay time (in seconds) to wait between requests. Default value is 1 second.

#### Input

No input is required.

#### Output

| name        | slug        | privacy | description      | parentTeam  |
| ----------- | ----------- | ------- | ---------------- | ----------- |
| Sample Team | sample-team | closed  | sample team desc | parent-team |

### 5. Export Bitbucket Team Members

#### exort-bitbucket-team-members

Exports team members of a bitbucket project.

#### Usage

```
git-migrator export-bitbucket-team-members
```

#### Arguments

1. `-o` or `--organization` - Organization name.
2. `-f` or `--input-file` - Input file name with team names.
3. `-b` or `--batch-size` - Batch size for requests.
4. `-g` or `--server-url` - The bitbucket server URL.
5. `-y` or `--output-file` - Output file to save the operation results. If not provided, the default file the results saved is `<organization>-bitbucket-team-members-<date-time>.csv`.
6. `-t` or `--token` - Personal access token.
7. `-w` or `--wait-time` - Delay time (in seconds) to wait between requests. Default value is 1 second.

#### Input

| team   |
| ------ |
| team-1 |

#### Output

| member    | team   | role  |
| --------- | ------ | ----- |
| test-user | team-1 | admin |

### 6. Export Bitbucket Project Users

#### export-bitbucket-project-users

Exports users of a bitbucket project.

#### Usage

```
git-migrator export-bitbucket-project-users
```

#### Arguments

1. `-o` or `--organization` - Organization name.
2. `-b` or `--batch-size` - Batch size for requests.
3. `-g` or `--server-url` - The bitbucket server URL.
4. `-y` or `--output-file` - Output file to save the operation results. If not provided, the default file the results saved is `<organization>-bitbucket-organization-users-<date-time>.csv`.
5. `-t` or `--token` - Personal access token.
6. `-w` or `--wait-time` - Delay time (in seconds) to wait between requests. Default value is 1 second.

#### Input

No input is required

#### Output

| login     |
| --------- |
| test-user |

### 7. Export Bitbucket Enterprise Users

#### export-bitbucket-enterprise-users

Exports users of a bitbucket enterprise.

#### Usage

```
git-migrator export-bitbucket-enterprise-users
```

#### Arguments

1. `-o` or `--organization` - Organization name.
2. `-b` or `--batch-size` - Batch size for requests.
3. `-g` or `--server-url` - The bitbucket server URL.
4. `-y` or `--output-file` - Output file to save the operation results. If not provided, the default file the results saved is `<organization>-bitbucket-enterprise-users-<date-time>.csv`.
5. `-t` or `--token` - Personal access token.
6. `-w` or `--wait-time` - Delay time (in seconds) to wait between requests. Default value is 1 second.

#### Input

No input is required

#### Output

| login     |
| --------- |
| test-user |

### C. GitLab

### 1. Export GitLab Repositories

#### export-gitlab-repositories

Exports all repositories of a Gitlab organization.

#### Usage

```
git-migrator export-gitlab-repositories
```

#### Arguments

1. `-o` or `--organization` - Organization name.
2. `-f` or `--input-file` - Input file name with repo name.
3. `-b` or `--batch-size` - Batch size for requests.
4. `-g` or `--server-url` - The gitlab server URL.
5. `-y` or `--output-file` - Output file to save the operation results. If not provided, the default file the results saved is `<organization>-gitlab-repos-<date-time>.csv`.
6. `-t` or `--token` - Personal access token.
7. `-w` or `--wait-time` - Delay time (in seconds) to wait between requests. Default value is 1 second.

#### Input

No input is required

#### Output

| name          | repo      | group        | id  | isArchived | visibility |
| ------------- | --------- | ------------ | --- | ---------- | ---------- |
| abc/repo-name | repo-name | sample-group | 123 | false      | private    |

### 2. Export GitLab Repo Direct Collaborators

#### export-gitlab-repo-direct-collaborators

Exports direct collaborators of all repositories of a Gitlab organization.

#### Usage

```
git-migrator export-gitlab-repo-direct-collaborators
```

#### Arguments

1. `-o` or `--organization` - Organization name.
2. `-f` or `--input-file` - Input file name with repo names.
3. `-b` or `--batch-size` - Batch size for requests.
4. `-g` or `--server-url` - The gitlab server URL.
5. `-y` or `--output-file` - Output file to save the operation results. If not provided, the default file the results saved is `<organization>-gitlab-repo-direct-collaborators-<date-time>.csv`.
6. `-t` or `--token` - Personal access token.
7. `-w` or `--wait-time` - Delay time (in seconds) to wait between requests. Default value is 1 second.

#### Input

| repo        |
| ----------- |
| sample-repo |

#### Output

| repo        | login     | role  |
| ----------- | --------- | ----- |
| sample-repo | test-user | write |

### 3. Export GitLab Teams

#### export-gitlab-teams

Exports all teams of a gitlab organization.

#### Usage

```
git-migrator export-gitlab-teams
```

#### Arguments

1. `-o` or `--organization` - Organization name.
2. `-b` or `--batch-size` - Batch size for requests.
3. `-g` or `--server-url` - The gitlab server URL.
4. `-y` or `--output-file` - Output file to save the operation results. If not provided, the default file the results saved is `<organization>-gitlab-teams-<date-time>.csv`.
5. `-t` or `--token` - Personal access token.
6. `-w` or `--wait-time` - Delay time (in seconds) to wait between requests. Default value is 1 second.

#### Input

No input is required.

#### Output

| name        | slug        | privacy | description      | parentTeam  |
| ----------- | ----------- | ------- | ---------------- | ----------- |
| Sample Team | sample-team | closed  | sample team desc | parent-team |

### 4. Export GitLab Team Members

#### export-gitlab-team-members

Exports team members of a gitlab organization.

#### Usage

```
git-migrator export-gitlab-team-members
```

#### Arguments

1. `-o` or `--organization` - Organization name.
2. `-f` or `--input-file` - Input file name with team names.
3. `-b` or `--batch-size` - Batch size for requests.
4. `-g` or `--server-url` - The gitlab server URL.
5. `-y` or `--output-file` - Output file to save the operation results. If not provided, the default file the results saved is `<organization>-gitlab-team-members-<date-time>.csv`.
6. `-t` or `--token` - Personal access token.
7. `-w` or `--wait-time` - Delay time (in seconds) to wait between requests. Default value is 1 second.

#### Input

| team   |
| ------ |
| team-1 |

#### Output

| member    | team   | role  |
| --------- | ------ | ----- |
| test-user | team-1 | admin |

### 5. Export GitLab Users

#### export-gitlab-users

Exports users of a gitlab organization.

#### Usage

```
git-migrator export-gitlab-users
```

#### Arguments

1. `-o` or `--organization` - Organization name.
2. `-b` or `--batch-size` - Batch size for requests.
3. `-g` or `--server-url` - The gitlab server URL.
4. `-y` or `--output-file` - Output file to save the operation results. If not provided, the default file the results saved is `<organization>-gitlab-users-<date-time>.csv`.
5. `-t` or `--token` - Personal access token.
6. `-w` or `--wait-time` - Delay time (in seconds) to wait between requests. Default value is 1 second.

#### Input

No input is required

#### Output

| login     |
| --------- |
| test-user |

## Import

### A. GitHub Enterprise Cloud - GHEC

### 1. Import Members To The Organization

#### import-github-membership-in-org

Adds or removes members from a github organization.

#### Usage

```
git-migrator import-github-membership-in-org
```

#### Arguments

1. `-f` or `--input-file` - Input file name with member name.
2. `-o` or `--organization` - Organization name.
3. `-d` or `--delete-member` - Boolean flag. If set then it will remove the members from the organization.
4. `-g` or `--server-url` - The target GHES server endpoint url. If this argument is skipped then the target will the cloud instance.
5. `-y` or `--output-file` - Output file to save the operation results. If not provided, the default file the results saved is `<organization>-set-membership-in-org-status-<timestamp>.csv`. The output files logs the successfully deleted organization members.
6. `-t` or `--token` - Personal access token.
7. `-s` or `--skip` - Number of lines to skip in the input file. Default is set to 0.
8. `-w` or `--wait-time` - Delay time (in seconds) to wait between requests. Default value is 1 second.

#### Input

| login        |
| ------------ |
| example-user |

#### Output

| login        | status  | statusText | errorMessage |
| ------------ | ------- | ---------- | ------------ |
| example-user | Success |            |              |

### 2. Import Github teams

#### import-github-teams

Imports teams to a github organization.

#### Usage

```
git-migrator import-github-teams
```

#### Arguments

1. `-f` or `--input-file` - Input file name with teams info.
2. `-o` or `--organization` - Organization name.
3. `-z` or `--github-user` - GitHub username who is performing the operation, to delete the user after the team is created, because by default when a team is created, the user who created it will be added to the team.
4. `-g` or `--server-url` - The target GHES server endpoint url. If this argument is skipped then the target will the cloud instance.
5. `-y` or `--output-file` - Output file to save the operation results. If not provided, the default file the results saved is `<organization>-create-teams-status-<timestamp>.csv`. The output file logs the names of the successfully migrated team names.
6. `-t` or `--token` - Personal access token.
7. `-s` or `--skip` - Number of lines to skip in the input file. Default is set to 0.
8. `-w` or `--wait-time` - Delay time (in seconds) to wait between requests. Default value is 1 second.

#### Input

| name        | id  | slug        | combinedSlug    | description | privacy | url             | repositories         | repositoriesCount | childTeams | members                | membersCount | parentTeam       | parentTeamId | repositoriesUrl | repositoriesResourcePath            | resourcePath           | createdAt            | updatedAt            |
| ----------- | --- | ----------- | --------------- | ----------- | ------- | --------------- | -------------------- | ----------------- | ---------- | ---------------------- | ------------ | ---------------- | ------------ | --------------- | ----------------------------------- | ---------------------- | -------------------- | -------------------- |
| Sample Team | 123 | sample-team | org/sample-team | Desc        | closed  | https://url.com | repo-name:permission | 1                 | null       | abc:abc@email.com:role | 1            | parent-team-slug | 2            | https://url.com | /orgs/org/teams/owners/repositories | /orgs/org/teams/owners | 2018-11-02T21:22:15Z | 2018-11-02T21:22:15Z |

Required fields in the input CSV file are:

1. name
2. description
3. privacy
4. parentTeam - Slug of the parent team
5. slug

#### Output

| team   | status  | statusText | errorMessage |
| ------ | ------- | ---------- | ------------ |
| team a | Success |            |              |
| team b | Success |            |              |

### 3. Import Members To Github Teams

#### import-github-team-members

Imports members to teams with the specified roles.

#### Usage

```
git-migrator import-github-team-members
```

#### Arguments

1. `-f` or `--input-file` - Input file name with teams, member, and roles.
2. `-o` or `--organization` - Organization name.
3. `-g` or `--server-url` - The target GHES server endpoint url. If this argument is skipped then the target will the cloud instance.
4. `-y` or `--output-file` - Output file to save the operation results. If not provided, the default file the results saved is `<organization>-insert-team-members-status-<timestamp>.csv`. The output files logs the successfully inserted teams members.
5. `-t` or `--token` - Personal access token.
6. `-s` or `--skip` - Number of lines to skip in the input file. Default is set to 0.
7. `-w` or `--wait-time` - Delay time (in seconds) to wait between requests. Default value is 1 second.

#### Input

| member       | team        | role   |
| ------------ | ----------- | ------ |
| example-user | sample-team | MEMBER |

To migrate the team members from GHES to GHEC, use the team members output file of **[get-teams](https://github.com/ModusCreateOrg/gh-migration-scripts#8-get-teams)** operation.

### 4. Import Github Repo direct collaborators

#### import-github-repo-collaborators

Adds or removes direct collaborators of repositories in an organization.

#### Usage

```
git-migrator import-github-repo-collaborators
```

#### Arguments

1. `-f` or `--input-file` - Input file name with repo, collaborators & roles info.
2. `-o` or `--organization` - Organization name.
3. `-g` or `--server-url` - The target GHES server endpoint url. If this argument is skipped then the target will the cloud instance.
4. `-y` or `--output-file` - Output file to save the operation results. If not provided, the default file the results saved is `<organization>-set-repo-collaborators-status-<timestamp>.csv`. This output file logs the successful collaborators requests to repositories.
5. `-t` or `--token` - Personal access token.
6. `-r` or `--repos-file` - File with repos names so only those repos will be considered. Should have the column `repos`.
7. `-s` or `--skip` - Number of lines to skip in the input file. Default is set to 0.
8. `-w` or `--wait-time` - Delay time (in seconds) to wait between requests. Default value is 1 second.

#### Input

| repo     | login       | role  |
| -------- | ----------- | ----- |
| abc-repo | sample-user | admin |

#### Output

| repo     | login       | role  | status  | statusText | errorMessage |
| -------- | ----------- | ----- | ------- | ---------- | ------------ |
| abc-repo | sample-user | admin | Success |            |              |

### 5. Import github Repo Team Permission

#### import-github-repo-team-permission

Imports teams with permissions to the repositories in an organization.

#### Usage

```
git-migrator import-github-repo-team-permission
```

#### Arguments

1. `-f` or `--input-file` - Input file name with repo, team & permission info.
2. `-o` or `--organization` - Organization name.
3. `-g` or `--server-url` - The target GHES server endpoint url. If this argument is skipped then the target will the cloud instance.
4. `-y` or `--output-file` - Output file to save the operation results. If not provided, the default file the results saved is `<organization>-set-repo-team-permission-status-<timestamp>.csv`. This output file logs the successful teams permissions added to repositories.
5. `-t` or `--token` - Personal access token.
6. `-r` or `--repos-file` - File with repos names so only those repos will be considered. Should have the column `repos`.
7. `-s` or `--skip` - Number of lines to skip in the input file. Default is set to 0.
8. `-w` or `--wait-time` - Delay time (in seconds) to wait between requests. Default value is 1 second.

#### Input

| repo     | team        | permission |
| -------- | ----------- | ---------- |
| abc-repo | sample-team | write      |

## Compare

### A. GHES VS GHEC

### 1. Compare Teams

#### compare-teams

Compares team metrics for GHES and GHEC for an organization.

#### Usage

```
git-migrator compare-teams -c <ghec-file> -s <ghes-file>
```

#### Arguments

1. `-c` or `--ghec-file` - GHEC team metrics file.
2. `-s` or `--ghes-file` - GHES team metrics file.
3. `-o` or `--organization` - Organization name.
4. `-y` or `--output-file` - Output file to save the operation results. Default file names are discussed on the output section.
5. `-u` or `--users-file` - File with user names so only those users will be considered. Should have the column name `login`.

#### Input

| name        | id  | slug        | combinedSlug    | description | privacy | url             | repositories         | repositoriesCount | childTeams | members                | membersCount | parentTeam       | parentTeamId | repositoriesUrl | repositoriesResourcePath            | resourcePath           | createdAt            | updatedAt            |
| ----------- | --- | ----------- | --------------- | ----------- | ------- | --------------- | -------------------- | ----------------- | ---------- | ---------------------- | ------------ | ---------------- | ------------ | --------------- | ----------------------------------- | ---------------------- | -------------------- | -------------------- |
| Sample Team | 123 | sample-team | org/sample-team | Desc        | closed  | https://url.com | repo-name:permission | 1                 | null       | abc:abc@email.com:role | 1            | parent-team-slug | 2            | https://url.com | /orgs/org/teams/owners/repositories | /orgs/org/teams/owners | 2018-11-02T21:22:15Z | 2018-11-02T21:22:15Z |

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
| test-repo | test-team | admin      |

c. **Member role file** - File with members missing in teams as well as wrong permissions. It can be used to fix the mismatches as input for `insert-team-members` script.

Default file name - `<organization>-member-team-role-input.csv`

Format

| member | team      | role  |
| ------ | --------- | ----- |
| abc    | test-team | write |

### 2. Compare Repository Direct Collaborators

#### compare-repo-direct-collaborators

Compares repo direct collaborators between GHES and GHEC in an organization.

#### Usage

```
git-migrator compare-repo-direct-collaborators -c <ghec-file> -s <ghes-file>
```

#### Arguments

1. `-c` or `--ghec-file` - GHEC repo direct collaborators file.
2. `-s` or `--ghes-file` - GHES repo direct collaborators file.
3. `-o` or `--organization` - Organization name.
4. `-u` or `--users-file` - File with user names so only those users will be considered. Should have the column name `login`.
5. `z` or `--outside-collaborators-file` - File with outside collaborators names to not be included.

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

### 3. Check last commit

#### ghec-last-commit-check

#### Usage

Compares the last commits of all branches of every repositories between source and target organizations

```
git-migrator ghec-last-commit-check -p <ghec-organization> -q <source-organization> -h <source token> -t <target-token> -g <server-url>
```

#### Arguments

1. `-o` or `--organization` - Organization name.
2. `-f` or `--input-file` - Input file name with teams, member, and roles.
3. `-g` or `--server-url` - The target GHES server endpoint url. If this argument is skipped then the target will be the cloud instance.
4. `p` or `--source-organization` - Source organization name.
5. `q` or `--target-organization` - Target (GHEC) organization name
6. `-b` or `--batch-size` - Batch size for GraphQL request.
7. `-y` or `--output-file` - Output file to save the operation results. The default format is discussed below. Default file name is `<organization>-metrics/<source-organization>-<target-organization>-last-commit-check-<date>.csv`.
   _date_ - Format is DD/MM/YYYY
8. `-t` or `--token` - Personal access token of the target organization- If not provided, then the user wil be prompted to input the token.
9. `-s` or `--skip` - Number of lines to skip in the input file. Default is set to 0.
10. `-w` or `--wait-time` - Delay time (in seconds) to wait between requests. Default value is 1 second.

#### Input

Input is optional, a CSV file with header `repo`.

| repo        |
| ----------- |
| sample-repo |

### Miscellaneous

### 1. set-github-archived-status

Archive or unarchive repositories in a github organization.

#### Usage

```
git-migrator set-github-archived-status
```

#### Arguments

1. `-f` or `--input-file` - Input file name with repo, team & permission info.
2. `-o` or `--organization` - Organization name.
3. `-g` or `--server-url` - The target GHES server endpoint url. If this argument is skipped then the target will the cloud instance.
4. `-y` or `--output-file` - Output file to save the operation results. If not provided, the default file the results saved is `<organization>-set-archived-status-<timestamp>.csv`. This output file logs the successful requests.
5. `-t` or `--token` - Personal access token.
6. `-s` or `--skip` - Number of lines to skip in the input file. Default is set to 0.
7. `-u` or `--unarchive` - Boolean value, if set it will unarchive archived repos, if not set it will archive repos.
8. `-w` or `--wait-time` - Delay time (in seconds) to wait between requests. Default value is 1 second.

#### Input

| repo     |
| -------- |
| abc-repo |

#### Output

| repo     | status  | statusText | errorMessage |
| -------- | ------- | ---------- | ------------ |
| abc-repo | Success |            |              |

### 2. delete-github-repos

Delete repositories in an organization.

#### Usage

```
git-migrator delete-github-repos
```

#### Arguments

1. `-f` or `--input-file` - Input file name with repository names to delete.
2. `-o` or `--organization` - Organization name.
3. `-g` or `--server-url` - The target GHES server endpoint url. If this argument is skipped then the target will the cloud instance.
4. `-y` or `--output-file` - Output file to save the operation results. If not provided, the default file the results saved is `<organization>-delete-repos-status-<timestamp>.csv`. This output file logs the successful repositories deleted from the organization.
5. `-t` or `--token` - Personal access token.
6. `-s` or `--skip` - Number of lines to skip in the input file. Default is set to 0.
7. `-w` or `--wait-time` - Delay time (in seconds) to wait between requests. Default value is 1 second.

#### Input

| repo     |
| -------- |
| abc-repo |

#### Output

| repo     | status  | statusText | errorMessage |
| -------- | ------- | ---------- | ------------ |
| abc-repo | Success |            |              |

### 3. export-github-outside-collaborators

Exports outside collaborators of an organization.

#### Usage

```
git-migrator export-github-outside-collaborators
```

#### Arguments

1. `-o` or `--organization` - Organization name.
2. `-g` or `--server-url` - The target GHES server endpoint url. If this argument is skipped then the target will the cloud instance.
3. `-y` or `--output-file` - Output file to save the operation results. If not provided, the default file the results saved is `<organization>-outside-collaborators-<timestamp>.csv`.
4. `-t` or `--token` - Personal access token.
5. `-u` or `--users-file` - File with user names so only those users will be considered. Should have the column name `login`.
6. `-w` or `--wait-time` - Delay time (in seconds) to wait between requests. Default value is 1 second.

#### Input

No input file is required

#### Output

| login         |
| ------------- |
| sample-user1  |
| samples-user2 |

## Prerequisites

**Node V16+**

## Testing

Run the command:

```
npm run test
```

## Contributing

See [Contribution Guidelines](.github/CONTRIBUTING.md) and [Code of Conduct](.github/CODE_OF_CONDUCT.md).

# Modus Create

[Modus Create](https://moduscreate.com) is a digital product consultancy. We use a distributed team of the best talent in the world to offer a full suite of digital product design-build services; ranging from consumer facing apps, to digital migration, to agile development training, and business transformation.

<a href="https://moduscreate.com/?utm_source=labs&utm_medium=github&utm_campaign=gh-migration-scripts"><img src="https://res.cloudinary.com/modus-labs/image/upload/h_80/v1533109874/modus/logo-long-black.svg" height="80" alt="Modus Create"/></a>
<br />

This project is part of [Modus Labs](https://labs.moduscreate.com/?utm_source=labs&utm_medium=github&utm_campaign=gh-migration-scripts).

<a href="https://labs.moduscreate.com/?utm_source=labs&utm_medium=github&utm_campaign=gh-migration-scripts"><img src="https://res.cloudinary.com/modus-labs/image/upload/h_80/v1531492623/labs/logo-black.svg" height="80" alt="Modus Labs"/></a>

# Licensing

This project is [MIT licensed](./LICENSE).
