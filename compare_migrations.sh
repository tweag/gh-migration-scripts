#!/usr/bin/env bash

# Function to print usage
print_usage() {
  echo "Usage: $0 -i [input_csv] -a [source_api_url] -o [output_csv] -s [source_token] -t [destination_token] -p [path_to_analyzer] [-w [working_directory]] [-z [override_destination_org]] [-y [override_destination_repo_prefix]] [-l [log_file]]"
  echo "  -i [input_csv]                  A CSV with source_org,source_repo,destination_org,destination_repo"
  echo "  -a [source_api_url]             Source API URL (required for GHES)"
  echo "  -o [output_csv]                 A CSV file with match,source_org,source_repo,source_signature,target_org,target_repo,target_signature"
  echo "  -s [source_token]               Source system token (optional, if not provided, GH_SRC_PAT environment variable will be used)"
  echo "  -t [destination_token]          Destination system token (optional, if not provided, GH_DEST_PAT environment variable will be used)"
  echo "  -p [path_to_analyzer]           Path to the GitHub migration analyzer (optional, default: ./gh-migration-analyzer)"
  echo "  -w [working_directory]          Working directory (optional, uses a new temporary directory if not specified)"
  echo "  -z [override_destination_org]   Override destination org with this value (optional, useful for testing)"
  echo "  -y [override_destination_repo_prefix]   Prepend prefix to destination repo names (optional, useful for testing)"
  echo "  -l [log_file]                   Log file path (optional, default: compare_migrations.log)"
}

# Set defaults
DEFAULT_OUTPUT_FILE="comparison_output.csv"
DEFAULT_PATH_TO_ANALYZER="./gh-migration-analyzer"
TMPDIR=$(mktemp -d)
OVERRIDE_DESTINATION_ORG=""
OVERRIDE_DESTINATION_REPO_PREFIX=""
STARTDIR=$(pwd)

# Check options
while getopts "i:o:s:t:a:p:w:z:y:l:h" opt; do
  case "${opt}" in
    i)
      INPUT_FILE=${OPTARG}
      ;;
    o)
      OUTPUT_FILE=${OPTARG}
      ;;
    s)
      SOURCE_TOKEN=${OPTARG}
      ;;
    t)
      DESTINATION_TOKEN=${OPTARG}
      ;;
    a)
      GHES_API_URL=${OPTARG}
      ;;
    p)
      PATH_TO_ANALYZER=${OPTARG}
      ;;
    w)
      TMPDIR=${OPTARG}
      ;;
    z)
      OVERRIDE_DESTINATION_ORG=${OPTARG}
      ;;
    y)
      OVERRIDE_DESTINATION_REPO_PREFIX=${OPTARG}
      ;;
    l)
      LOG_FILE=${OPTARG}
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

# Log file
LOG_FILE_NAME="compare_migrations.log"
LOG_FILE="${LOG_FILE:-LOG_FILE_NAME}"

PATH_TO_ANALYZER="${PATH_TO_ANALYZER:-$DEFAULT_PATH_TO_ANALYZER}"
OUTPUT_FILE="${OUTPUT_FILE:-$DEFAULT_OUTPUT_FILE}"

# Function to log messages
log() {
  local message="$1"

  # Log to the log file
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $message" >> "$LOG_FILE"

  # Log to the console
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $message"
}

# Check if required parameters are provided
if [ -z "${INPUT_FILE}" ] || [ -z "${OUTPUT_FILE}" ] || [ -z "${GHES_API_URL}" ]; then
  log "Error: Not all required parameters are provided."
  print_usage
  exit 1
fi

# Check if the input file exists
if [ ! -f "${INPUT_FILE}" ]; then
  log "Error: Input file '${INPUT_FILE}' does not exist."
  exit 1
fi

# Check if source token is provided or GH_SRC_PAT environment variable is set
if [ -z "${SOURCE_TOKEN}" ] && [ -z "${GH_SRC_PAT}" ]; then
  log "Error: Source token not provided, and GH_SRC_PAT environment variable is not set."
  print_usage
  exit 1
fi

# Use GH_SRC_PAT environment variable if SOURCE_TOKEN is not provided
if [ -z "${SOURCE_TOKEN}" ]; then
  SOURCE_TOKEN="${GH_SRC_PAT}"
fi

# Check if destination token is provided or GH_DEST_PAT environment variable is set
if [ -z "${DESTINATION_TOKEN}" ] && [ -z "${GH_DEST_PAT}" ]; then
  log "Error: Destination token not provided, and GH_DEST_PAT environment variable is not set."
  print_usage
  exit 1
fi

# Use GH_DEST_PAT environment variable if DESTINATION_TOKEN is not provided
if [ -z "${DESTINATION_TOKEN}" ]; then
  DESTINATION_TOKEN="${GH_DEST_PAT}"
fi

# Check if the GitHub migration analyzer is available
if [ ! -f "${PATH_TO_ANALYZER}/src/index.js" ]; then
  log "Error: GitHub migration analyzer not found at '${PATH_TO_ANALYZER}/src/index.js'."
  exit 1
fi

log "Working in ${TMPDIR}"

# Copy the input file to the working directory
cp "${INPUT_FILE}" "${TMPDIR}"
cd "${TMPDIR}" || { log "Error: Unable to change to temporary directory ${TMPDIR}"; exit 1; }

log "Downloading required data files..."

# Download source and destination org data
while IFS=, read SOURCE_ORG SOURCE_REPO DESTINATION_ORG DESTINATION_REPO; do
  # Override destination org and repo for debugging
  if [ -n "${OVERRIDE_DESTINATION_ORG}" ]; then
    DESTINATION_ORG="${OVERRIDE_DESTINATION_ORG}"
  fi
  if [ -n "${OVERRIDE_DESTINATION_REPO_PREFIX}" ]; then
    DESTINATION_REPO="${OVERRIDE_DESTINATION_REPO_PREFIX}${DESTINATION_REPO}"
  fi

  # Download source org data
  if [ ! -f "./${SOURCE_ORG}-metrics/repo-metrics.csv" ]; then
    log "-> Downloading org data for ${SOURCE_ORG}"
    if ! "${PATH_TO_ANALYZER}/src/index.js" GH-org -o "${SOURCE_ORG}" -a -s "${GHES_API_URL}" -t "${SOURCE_TOKEN}" &>/dev/null; then
      log "Error: Failed to download source org data for ${SOURCE_ORG}."
      exit 1
    fi
    if [ ! -f "./${SOURCE_ORG}-metrics/repo-metrics.csv" ]; then
      log "Error: Failed to download source org data for ${SOURCE_ORG}."
      exit 1
    fi
    log "-> Got org data for ${SOURCE_ORG}"
  fi

  # Download destination data
  if [ ! -f "./${DESTINATION_ORG}-metrics/repo-metrics.csv" ]; then
    log "-> Downloading org data for ${DESTINATION_ORG}"
    if ! "${PATH_TO_ANALYZER}/src/index.js" GH-org -o "${DESTINATION_ORG}" -t "${DESTINATION_TOKEN}" &>/dev/null; then
      log "Error: Failed to download destination org data for ${DESTINATION_ORG}."
      exit 1
    fi
    if [ ! -f "./${DESTINATION_ORG}-metrics/repo-metrics.csv" ]; then
      log "Error: Failed to download destination org data for ${DESTINATION_ORG}."
      exit 1
    fi
    log "-> Got org data for ${DESTINATION_ORG}"
  fi
done <"${INPUT_FILE}"

log "OK, we should have all the data now."

# Print output CSV header
touch "${OUTPUT_FILE}"
echo "match,source_org,source_repo,source_signature,destination_org,destination_repo,destination_signature" >"${OUTPUT_FILE}"

while IFS=, read SOURCE_ORG SOURCE_REPO DESTINATION_ORG DESTINATION_REPO; do
  # Override destination org and repo for debugging
  if [ -n "${OVERRIDE_DESTINATION_ORG}" ]; then
    DESTINATION_ORG="${OVERRIDE_DESTINATION_ORG}"
  fi
  if [ -n "${OVERRIDE_DESTINATION_REPO_PREFIX}" ]; then
    DESTINATION_REPO="${OVERRIDE_DESTINATION_REPO_PREFIX}${DESTINATION_REPO}"
  fi

  # Create a "signature" for each repo based on its archive status, number of pull requests, number of discussions, number of releases, and whether the wiki is enabled
  SOURCE_REPO_SIGNATURE=$(grep "^${SOURCE_REPO}," "./${SOURCE_ORG}-metrics/repo-metrics.csv" | cut -d, -f3,4,7-10)
  DESTINATION_REPO_SIGNATURE=$(grep "^${DESTINATION_REPO}," "./${DESTINATION_ORG}-metrics/repo-metrics.csv" | cut -d, -f3,4,7-10)

  if [ "${SOURCE_REPO_SIGNATURE}" != "${DESTINATION_REPO_SIGNATURE}" ]; then
    OUTPUT="FALSE"
  else
    OUTPUT="TRUE"
  fi
  OUTPUT="${OUTPUT},${SOURCE_ORG},${SOURCE_REPO},\"${SOURCE_REPO_SIGNATURE}\",${DESTINATION_ORG},${DESTINATION_REPO},\"${DESTINATION_REPO_SIGNATURE}\""
  echo "${OUTPUT}"
  echo "${OUTPUT}" >>"${OUTPUT_FILE}"
done <"${INPUT_FILE}"

cd "${STARTDIR}"
log "Data files and output can be found in ${TMPDIR}"
