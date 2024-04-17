# This script examines a directory containing all the log files after starting migrations with
# the gei tool, and finds which ones failed with errors
# It outputs a list of the source org, source repo, destination org, and destination repo

#!/usr/bin/env bash
set -e 

# Set defaults
LOG_DIRECTORY=""

# Check options
while getopts "d:" o; do
  case "${o}" in
    d)
      LOG_DIRECTORY=${OPTARG}
      ;;
  esac
done

if [ -z "${LOG_DIRECTORY}" ]; then
  echo "Specify the directory where the logs are with the -d parameter"
  exit 1;
fi

echo "source_org,source_repo,destination_org,destination_repo"
for LOGFILE in $(grep -l "\[ERROR\]" ${LOG_DIRECTORY}/*.octoshift.log); do 

   # get the verbose log file name
   VERBOSE_LOGFILE=$(echo ${LOGFILE} | sed "s/\octoshift.log/octoshift.verbose.log/")
   ERROR=$(cat ${VERBOSE_LOGFILE} | grep "\[ERROR\]" | sed "s/^.\+\[ERROR\] \(.\+\)/\\1/")
   cat "${LOGFILE}" | tr '\n' ' ' | sed "s/^.\+GITHUB SOURCE ORG: \([^ ]\+\).\+SOURCE REPO: \([^ ]\+\).\+GITHUB TARGET ORG: \([^ ]\+\).\+TARGET REPO: \([^ ]\+\).\+/\\1,\\2,\\3,\\4/"
   echo ",\"${ERROR}\""
done