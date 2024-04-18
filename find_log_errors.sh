#!/usr/bin/env bash
#
# This script examines a directory containing all the log files after starting migrations with
# the gei tool, and finds which ones failed with errors.
# It outputs a list of the source org, source repo, destination org, destination repo, and error message.

set -euo pipefail

# Function to display script usage
usage() {
  echo "Usage: $0 -d <log_directory>"
  echo "Options:"
  echo "  -d <log_directory>   Specify the directory where the logs are"
  exit 1
}

# Parse command line options
while getopts "d:" opt; do
  case "${opt}" in
    d)
      LOG_DIRECTORY=${OPTARG}
      ;;
    *)
      usage
      ;;
  esac
done

# Check if log directory is provided
if [ -z "${LOG_DIRECTORY:-}" ]; then
  echo "Error: Log directory is not specified."
  usage
fi

# Check if log directory exists
if [ ! -d "${LOG_DIRECTORY}" ]; then
  echo "Error: Log directory '${LOG_DIRECTORY}' does not exist."
  exit 1
fi

# Print header
echo "source_org,source_repo,destination_org,destination_repo,error_message"

# Process log files
for LOGFILE in "${LOG_DIRECTORY}"/*.octoshift.log; do
  # Check if log file contains errors
  if grep -q "\[ERROR\]" "${LOGFILE}"; then
    # Get the verbose log file name
    VERBOSE_LOGFILE="${LOGFILE%.octoshift.log}.octoshift.verbose.log"
    # Extract error message
    ERROR=$(grep "\[ERROR\]" "${VERBOSE_LOGFILE}" | sed "s/^.\+\[ERROR\] \(.\+\)/\\1/")
    # Extract org and repo information
    INFO=$(grep -oP "GITHUB SOURCE ORG: \K[^ ]+|SOURCE REPO: \K[^ ]+|GITHUB TARGET ORG: \K[^ ]+|TARGET REPO: \K[^ ]+" "${LOGFILE}" | tr '\n' ',' | sed 's/,$//')
    # Print org, repo, and error message
    echo "${INFO},${ERROR}"
  fi
done