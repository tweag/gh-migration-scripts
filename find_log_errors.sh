#!/usr/bin/env bash

# Log file
LOG_FILE="find_log_errors.log"

# Function to log messages
log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" >> "${LOG_FILE}"
}

# Function to print usage
print_usage() {
  echo "Usage: $0 [log_directory]"
  echo "This script examines a directory containing all the log files after starting migrations with the GEI tool, and finds which ones failed with errors."
  echo "It outputs a list of the source org, source repo, destination org, destination repo, and the error message."
  echo "If no directory is provided, it checks the current working directory for the log files."
}

# Set the log directory to the current working directory if not provided
LOG_DIRECTORY="${1:-$PWD}"

# Check if the log directory exists
if [ ! -d "${LOG_DIRECTORY}" ]; then
  log "Error: Log directory '${LOG_DIRECTORY}' does not exist."
  exit 1
fi

# Check if log files exist in the specified directory
if [ ! "$(ls "${LOG_DIRECTORY}"/*.octoshift.log 2>/dev/null)" ]; then
  log "Error: No log files found in the directory '${LOG_DIRECTORY}'."
  print_usage
  exit 1
fi

log "Searching for errors in log files in '${LOG_DIRECTORY}'..."

# Print the header
echo "source_org,source_repo,destination_org,destination_repo,error_message"

for LOGFILE in "${LOG_DIRECTORY}"/*.octoshift.log; do
  # Get the verbose log file name
  VERBOSE_LOGFILE=$(echo "${LOGFILE}" | sed "s/\.octoshift\.log/\.octoshift\.verbose\.log/")

  # Extract the error message
  ERROR=$(grep "\[ERROR\]" "${VERBOSE_LOGFILE}" | sed "s/^.*\[ERROR\] \(.*\)/\1/")

  # Extract the source org, source repo, destination org, and destination repo
  SOURCE_ORG=$(grep "GITHUB SOURCE ORG:" "${LOGFILE}" | sed "s/^.*GITHUB SOURCE ORG: \([^ ]*\).*$/\1/")
  SOURCE_REPO=$(grep "SOURCE REPO:" "${LOGFILE}" | sed "s/^.*SOURCE REPO: \([^ ]*\).*$/\1/")
  DESTINATION_ORG=$(grep "GITHUB TARGET ORG:" "${LOGFILE}" | sed "s/^.*GITHUB TARGET ORG: \([^ ]*\).*$/\1/")
  DESTINATION_REPO=$(grep "TARGET REPO:" "${LOGFILE}" | sed "s/^.*TARGET REPO: \([^ ]*\).*$/\1/")

  # Print the output
  echo "${SOURCE_ORG},${SOURCE_REPO},${DESTINATION_ORG},${DESTINATION_REPO},\"${ERROR}\""
done
