#!/bin/bash

# This script checks the downloaded migration log files to see which ones completed successfully
# and how long the migration took.
# It expects to be run from within the directory where the log files are located

LOG_FILES="migration-log-*.log"

echo -n "Checking migration logs for completion status..."

# Check if the log files exist in the current directory
if [ ! -f "$LOG_FILES" ]; then
  echo "Migration Log files with the format '$LOG_FILES' not found. Exiting."
  exit 1
fi

# Count the number of started and completed migrations
MIGRATION_STARTED_COUNT=$(grep -c "Migration started" $LOG_FILES)
MIGRATION_COMPLETED_COUNT=$(grep -c "Migration complete" $LOG_FILES)

echo "done."
echo "${MIGRATION_COMPLETED_COUNT}/${MIGRATION_STARTED_COUNT} migrations completed."

# If the number of started and completed migrations is not the same, exit with an error
if [ $MIGRATION_STARTED_COUNT -ne $MIGRATION_COMPLETED_COUNT ]; then
  echo "Exiting because not all migrations completed."
  exit 1
fi

echo -n "Checking duration..."

# Get the earliest and latest migration timestamps
MIGRATION_STARTED_TIME=$(grep -oP "(?<=^\[).+?(?=\])" $LOG_FILES | sort | head -1)
MIGRATION_ENDED_TIME=$(grep -oP "(?<=^\[).+?(?=\])" $LOG_FILES | sort | tail -n 1)

echo "done."
echo "Migration started at ${MIGRATION_STARTED_TIME} and ended at ${MIGRATION_ENDED_TIME}"
