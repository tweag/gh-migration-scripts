#!/usr/bin/env bash

# Function to print usage
print_usage() {
  echo "Usage: $0 [-d log_directory] [-l log_file]"
  echo "This script checks the downloaded migration log files to see which ones completed successfully and how long the migration took."
  echo "-d [log_directory] Log directory path (optional, default: current working directory)"
  echo "-l [log_file] Log file path (optional, default: check_migrations.log)"
}

# Check if a directory is provided
LOG_DIRECTORY="${1:-$PWD}"

# Check options
while getopts "d:l:h" opt; do
  case "${opt}" in
    d)
      LOG_DIRECTORY=${OPTARG}
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

# Set the log directory to the current working directory if not provided
LOG_DIRECTORY="${LOG_DIRECTORY:-$PWD}"
# Log file
LOG_FILE_NAME="check_migrations.log"
LOG_FILE="${LOG_FILE:-LOG_FILE_NAME}"

# Function to log messages
log() {
  local message="$1"

  # Log to the log file
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $message" >> "$LOG_FILE"

  # Log to the console
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $message"
}

# Check if log files directory exists
if [ ! -d "$LOG_DIRECTORY" ]; then
  log "Error: Directory '$LOG_DIRECTORY' not found."
  print_usage
  exit 1
fi

# Check if log files exist in the specified directory
if [ ! "$(ls "${LOG_DIRECTORY}"/migration-log-*.log 2>/dev/null)" ]; then
  log "Error: No migration log files found in the directory '${LOG_DIRECTORY}'."
  print_usage
  exit 1
fi

log "Checking migration logs in '${LOG_DIRECTORY}' for completion status..."

# Count the number of migrations started
MIGRATION_STARTED_COUNT=$(grep "Migration started" "${LOG_DIRECTORY}"/migration-log-*.log | wc -l)
if [ "${MIGRATION_STARTED_COUNT}" -eq 0 ]; then
  log "Error: No migrations started found in the log files."
  exit 1
fi

# Count the number of migrations completed
MIGRATION_COMPLETED_COUNT=$(grep "Migration complete" "${LOG_DIRECTORY}"/migration-log-*.log | wc -l)

log "${MIGRATION_COMPLETED_COUNT}/${MIGRATION_STARTED_COUNT} migrations completed."

if [ "${MIGRATION_STARTED_COUNT}" -ne "${MIGRATION_COMPLETED_COUNT}" ]; then
  log "Error: Not all migrations completed."
  exit 1
fi

log "Checking migration duration..."

# Get the start and end times of the migration
MIGRATION_STARTED_TIME=$(sed -n "s/^\[\(.*\)\] INFO -- Migration started.\+$/\1/p" "${LOG_DIRECTORY}"/migration-log-*.log | sort | head -1)
MIGRATION_ENDED_TIME=$(sed -n "s/^\[\(.*\)\] INFO -- Migration complete/\1/p" "${LOG_DIRECTORY}"/migration-log-*.log | sort | tail -n 1)

if [ -z "${MIGRATION_STARTED_TIME}" ] || [ -z "${MIGRATION_ENDED_TIME}" ]; then
  log "Error: Unable to determine migration start or end time."
  exit 1
fi

log "Migration started at ${MIGRATION_STARTED_TIME} and ended at ${MIGRATION_ENDED_TIME}"
