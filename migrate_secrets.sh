# Migrate secrets (without values) for a given list of repositories

# Usage:
# -i [input_csv] A CSV with source_org,source_repo,destination_org,DESTINATION_REPO
# -s [source system token]
# -t [destination system token]
# -z [override destination org with this value; useful for testing]
# -y [prepend prefix to destination repo names; useful for testing]

# TODO: Add parameter for source system API in case of migrating from GHES

#!/usr/bin/env bash
set -e 

# Set defaults
OVERRIDE_DESTINATION_ORG=""
OVERRIDE_DESTINATION_REPO_PREFIX=""
# Check options
while getopts "i:o:s:t:a:p:w:z:y:" o; do
  case "${o}" in
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
  esac
done

if [ -z "${INPUT_FILE}" ] || [ -z "${SOURCE_TOKEN}" ] || [ -z "${DESTINATION_TOKEN}" ]; then
  echo "Not all required parameters are provided.  View the top of this source file to see comment."
  exit 1;
fi

while IFS=, read SOURCE_ORG SOURCE_REPO DESTINATION_ORG DESTINATION_REPO
do 

  # Override for debugging
  if [ ! -z "${OVERRIDE_DESTINATION_ORG}" ]; then
    DESTINATION_ORG="${OVERRIDE_DESTINATION_ORG}"
  fi
  if [ ! -z "${OVERRIDE_DESTINATION_REPO_PREFIX}" ]; then
    DESTINATION_REPO="${OVERRIDE_DESTINATION_REPO_PREFIX}${DESTINATION_REPO}"
  fi

  echo "Fetching secrets for ${SOURCE_ORG}/${SOURCE_REPO}"
  set +e
  for SECRET_NAME in $(GITHUB_TOKEN="${SOURCE_TOKEN}" gh secret list --repo ${SOURCE_ORG}/${SOURCE_REPO} | tail -n +2 | cut -d$'\t' -f1)
  do
    echo "${SECRET_NAME} -> ${DESTINATION_ORG}/${DESTINATION_REPO}"
	GITHUB_TOKEN="${DESTINATION_TOKEN}" gh secret set "${SECRET_NAME}" --body placeholder --repo ${DESTINATION_ORG}/${DESTINATION_REPO}
  done
  set -e
  
#  GITHUB_TOKEN="${SOURCE_TOKEN}" gh variable list --repo ${SOURCE_ORG}/${SOURCE_REPO}
  
 
done < "${INPUT_FILE}"