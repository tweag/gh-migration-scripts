#!/usr/bin/env bash

# Log file
LOG_FILE="check_migrations.log"

# Function to log messages
log() {
  local message="$1"

  # Log to the log file
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $message" >> "$LOG_FILE"

  # Log to the console
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $message"
}

# Function to print usage
print_usage() {
  echo "Usage: $0 [directory] [-l [log_file]]"
  echo "This script checks the downloaded migration log files to see which ones completed successfully and how long the migration took."
  echo "If no directory is provided, it checks the current working directory for the log files."
  echo "-l [log_file] Log file path (optional, default: check_migrations.log)"
}

# Check if a directory is provided
LOG_FILES_DIR="${1:-$PWD}"

# Check options
while getopts "l:h" opt; do
  case "${opt}" in
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

# Check if log files directory exists
if [ ! -d "$LOG_FILES_DIR" ]; then
  log "Error: Directory '$LOG_FILES_DIR' not found."
  print_usage
  exit 1
fi

# Check if log files exist in the specified directory
if [ ! "$(ls "${LOG_FILES_DIR}"/migration-log-*.log 2>/dev/null)" ]; then
  log "Error: No migration log files found in the directory '${LOG_FILES_DIR}'."
  print_usage
  exit 1
fi

log "Checking migration logs in '${LOG_FILES_DIR}' for completion status..."

# Count the number of migrations started
MIGRATION_STARTED_COUNT=$(grep "Migration started" "${LOG_FILES_DIR}"/migration-log-*.log | wc -l)
if [ "${MIGRATION_STARTED_COUNT}" -eq 0 ]; then
  log "Error: No migrations started found in the log files."
  exit 1
fi

# Count the number of migrations completed
MIGRATION_COMPLETED_COUNT=$(grep "Migration complete" "${LOG_FILES_DIR}"/migration-log-*.log | wc -l)

log "${MIGRATION_COMPLETED_COUNT}/${MIGRATION_STARTED_COUNT} migrations completed."

if [ "${MIGRATION_STARTED_COUNT}" -ne "${MIGRATION_COMPLETED_COUNT}" ]; then
  log "Error: Not all migrations completed."
  exit 1
fi

log "Checking migration duration..."

# Get the start and end times of the migration
MIGRATION_STARTED_TIME=$(sed -n "s/^\[\(.*\)\] INFO -- Migration started.\+$/\1/p" "${LOG_FILES_DIR}"/migration-log-*.log | sort | head -1)
MIGRATION_ENDED_TIME=$(sed -n "s/^\[\(.*\)\] INFO -- Migration complete/\1/p" "${LOG_FILES_DIR}"/migration-log-*.log | sort | tail -n 1)

if [ -z "${MIGRATION_STARTED_TIME}" ] || [ -z "${MIGRATION_ENDED_TIME}" ]; then
  log "Error: Unable to determine migration start or end time."
  exit 1
fi

log "Migration started at ${MIGRATION_STARTED_TIME} and ended at ${MIGRATION_ENDED_TIME}"
