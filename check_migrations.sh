# This script checks the downloaded migration log files to see which ones completed successfully
# and how long the migration took.
# It expects to be run from within the directory where the log files are located



echo -n "Checking migration logs for completion status..."

# Now check to see how many were started
MIGRATION_STARTED_COUNT=$(grep "Migration started" migration-log-*.log | wc -l)

# And how many completed
MIGRATION_COMPLETED_COUNT=$(grep "Migration complete" migration-log-*.log | wc -l)

echo "done."
echo "${MIGRATION_COMPLETED_COUNT}/${MIGRATION_STARTED_COUNT} migrations completed."

if [ "${MIGRATION_STARTED_COUNT}" -ne "${MIGRATION_COMPLETED_COUNT}" ]; then
  echo "Exiting because not all migrations completed."
  exit 1
fi

echo -n "Checking duration..."

MIGRATION_STARTED_TIME=$(sed -n "s/^\[\(.\+\)\] INFO -- Migration started.\+$/\\1/p" *.log | sort | head -1)
MIGRATION_ENDED_TIME=$(sed -n "s/^\[\(.\+\)\] INFO -- Migration complete/\\1/p" *.log | sort | tail -n 1)

echo "done."
echo "Migration started at ${MIGRATION_STARTED_TIME} and ended at ${MIGRATION_ENDED_TIME}"
