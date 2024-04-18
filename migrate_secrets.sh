#!/usr/bin/env bash

# Log file
LOG_FILE="migrate_secrets.log"

# Function to log messages
log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" >> "${LOG_FILE}"
}

# Function to print usage
print_usage() {
  echo "Migrate secrets (without values) for a given list of repositories"
  echo "Usage: $0 -i [input_csv] -s [source_token] -t [destination_token] [-z [override_destination_org]] [-y [override_destination_repo_prefix]] [-a [source_api_url]]"
  echo "  -i [input_csv]                  A CSV with source_org,source_repo,destination_org,destination_repo"
  echo "  -s [source_token]               Source system token"
  echo "  -t [destination_token]          Destination system token"
  echo "  -z [override_destination_org]   Override destination org with this value (optional, useful for testing)"
  echo "  -y [override_destination_repo_prefix]   Prepend prefix to destination repo names (optional, useful for testing)"
  echo "  -a [source_api_url]             Source system API URL (optional, required for GHES)"
}

# Set defaults
OVERRIDE_DESTINATION_ORG=""
OVERRIDE_DESTINATION_REPO_PREFIX=""
SOURCE_API_URL=""

# Check if 'gh' command is installed
if ! command -v gh &> /dev/null; then
  log "Error: 'gh' command not found. Please install the GitHub CLI (https://cli.github.com/) before running this script."
  exit 1
fi

# Check options
while getopts "i:s:t:z:y:a:h" opt; do
  case "${opt}" in
    i)
      INPUT_FILE=${OPTARG}
      ;;
    s)
      SOURCE_TOKEN=${OPTARG}
      ;;
    t)
      DESTINATION_TOKEN=${OPTARG}
      ;;
    z)
      OVERRIDE_DESTINATION_ORG=${OPTARG}
      ;;
    y)
      OVERRIDE_DESTINATION_REPO_PREFIX=${OPTARG}
      ;;
    a)
      SOURCE_API_URL=${OPTARG}
      ;;
    h)
      print_usage
      exit 0
      ;;
    *)
      print_usage
      exit 1
      ;;
  esac
done

# Check if required parameters are provided
if [ -z "${INPUT_FILE}" ] || [ -z "${SOURCE_TOKEN}" ] || [ -z "${DESTINATION_TOKEN}" ]; then
  log "Error: Not all required parameters are provided."
  print_usage
  exit 1
fi

# Check if input file exists
if [ ! -f "${INPUT_FILE}" ]; then
  log "Error: Input file '${INPUT_FILE}' does not exist."
  exit 1
fi

# Loop through the input file
while IFS=, read SOURCE_ORG SOURCE_REPO DESTINATION_ORG DESTINATION_REPO; do
  # Trim leading/trailing whitespace
  SOURCE_ORG=$(echo "${SOURCE_ORG}" | xargs)
  SOURCE_REPO=$(echo "${SOURCE_REPO}" | xargs)
  DESTINATION_ORG=$(echo "${DESTINATION_ORG}" | xargs)
  DESTINATION_REPO=$(echo "${DESTINATION_REPO}" | xargs)

  # Override destination org and repo for debugging
  if [ -n "${OVERRIDE_DESTINATION_ORG}" ]; then
    DESTINATION_ORG="${OVERRIDE_DESTINATION_ORG}"
  fi
  if [ -n "${OVERRIDE_DESTINATION_REPO_PREFIX}" ]; then
    DESTINATION_REPO="${OVERRIDE_DESTINATION_REPO_PREFIX}${DESTINATION_REPO}"
  fi

  log "Fetching secrets for ${SOURCE_ORG}/${SOURCE_REPO}"

  # Set the source API URL if provided
  if [ -n "${SOURCE_API_URL}" ]; then
    GITHUB_API_URL="${SOURCE_API_URL}" GITHUB_TOKEN="${SOURCE_TOKEN}" gh secret list --repo "${SOURCE_ORG}/${SOURCE_REPO}" | tail -n +2 | cut -d$'\t' -f1
  else
    GITHUB_TOKEN="${SOURCE_TOKEN}" gh secret list --repo "${SOURCE_ORG}/${SOURCE_REPO}" | tail -n +2 | cut -d$'\t' -f1
  fi

  SECRETS_RESULT=$?

  if [ ${SECRETS_RESULT} -ne 0 ]; then
    log "Error: Failed to fetch secrets for ${SOURCE_ORG}/${SOURCE_REPO}"
    continue
  fi

  if [ -z "${SECRETS}" ]; then
    log "No secrets found for ${SOURCE_ORG}/${SOURCE_REPO}"
    continue
  fi

  for SECRET_NAME in ${SECRETS}; do
    log "${SECRET_NAME} -> ${DESTINATION_ORG}/${DESTINATION_REPO}"
    GITHUB_TOKEN="${DESTINATION_TOKEN}" gh secret set "${SECRET_NAME}" --body placeholder --repo "${DESTINATION_ORG}/${DESTINATION_REPO}" || log "Error: Failed to migrate secret ${SECRET_NAME} to ${DESTINATION_ORG}/${DESTINATION_REPO}"
  done

done < "${INPUT_FILE}"
