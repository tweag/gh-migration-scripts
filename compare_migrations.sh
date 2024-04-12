# Usage:
# -i [input_csv] A CSV with source_org,source_repo,destination_org,DESTINATION_REPO
# -o [output_csv_ A CSV file with match,source_org,source_repo,source_signature,target_org,target_repo,target_signature
# -s [source system token]
# -t [destination system token]
# -a [source api URL]
# -p [path to github migration analyzer]
# -w [working directory, uses new tmp directory if not specified]
# -z [override destination org with this value; useful for testing]
# -y [prepend prefix to destination repo names; useful for testing]

#!/usr/bin/env bash
set -e 

# Set defaults
OUTPUT_FILE="comparison_output.csv"
PATH_TO_ANALYZER="./gh-migration-analyzer"
TMPDIR="$(mktemp -d)"
OVERRIDE_DESTINATION_ORG=""
OVERRIDE_DESTINATION_REPO_PREFIX=""
STARTDIR="$(pwd)"
# Check options
while getopts "i:o:s:t:a:p:w:z:y:" o; do
  case "${o}" in
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
  esac
done

if [ -z "${INPUT_FILE}" ] || [ -z "${OUTPUT_FILE}" ] || [ -z "${SOURCE_TOKEN}" ] || [ -z "${DESTINATION_TOKEN}" ] || [ -z "${GHES_API_URL}" ]; then
  echo "Not all required parameters are provided.  View the top of this source file to see comment."
  exit 1;
fi

echo "Working in ${TMPDIR}"

# TODO: Parameterize input file
cp "${INPUT_FILE}" "${TMPDIR}"
cd "${TMPDIR}"

# Unfortunately we have to do TWO loops over all the repos
# This is because the github migration analyzer tool has no way to suppress its output and it's annoying to seem
# it mixed in with the other output.  (At least, that's the case in windows with gitbash and winpty)
# So let's just do one first loop to get all that out of the way, and then a second loop to do the comparison

echo "Downloading required data files..."
while IFS=, read SOURCE_ORG SOURCE_REPO DESTINATION_ORG DESTINATION_REPO
do 

  # Override for debugging
  if [ ! -z "${OVERRIDE_DESTINATION_ORG}" ]; then
    DESTINATION_ORG="${OVERRIDE_DESTINATION_ORG}"
  fi
  if [ ! -z "${OVERRIDE_DESTINATION_REPO_PREFIX}" ]; then
    DESTINATION_REPO="${OVERRIDE_DESTINATION_REPO_PREFIX}${DESTINATION_REPO}"
  fi

  # Download source org data
  if [ ! -f ./"${SOURCE_ORG}"-metrics/repo-metrics.csv ]; then
    echo "-> Downloading org data for ${SOURCE_ORG}"
    # Unfortunately there seems to be no way to redirect the stdout and stderror from this command to /dev/null so it gets messy at the console
	"${PATH_TO_ANALYZER}"/src/index.js GH-org -o "${SOURCE_ORG}" -a -s "${GHES_API_URL}" -t "${SOURCE_TOKEN}" 2>&1 > /dev/null
  fi
  # The github analyzer doesn't seem to return an error code on failure so let's check if it succeeded
  if [ ! -f ./"${SOURCE_ORG}"-metrics/repo-metrics.csv ]; then
	echo "Failed to download source org data for ${SOURCE_ORG}."
	exit 1;
  fi
  echo "-> Got org data for ${SOURCE_ORG}"
  
  
  # Download destination data
  if [ ! -f ./"${DESTINATION_ORG}"-metrics/repo-metrics.csv ]; then
    echo "-> Downloading org data for ${DESTINATION_ORG}"
    # Unfortunately there seems to be no way to redirect the stdout and stderror from this command to /dev/null so it gets messy at the console
	"${PATH_TO_ANALYZER}"/src/index.js GH-org -o "${DESTINATION_ORG}" -t "${DESTINATION_TOKEN}" 2>&1 > /dev/null
  fi
  if [ ! -f ./"${DESTINATION_ORG}"-metrics/repo-metrics.csv ]; then
    echo "Failed to download destination org data for ${DESTINATION_ORG}."
	exit 1; 
  fi
  echo "-> Got org data for ${DESTINATION_ORG}"
  
done < "${INPUT_FILE}"

echo
echo "OK we should have all the data now. Did you enjoy that?  Let's compare."
echo 


# Print output CSV header
touch "${OUTPUT_FILE}"
echo "match,source_org,source_repo,source_signature,destination_org,destination_repo,destination_signature" > "${OUTPUT_FILE}"
while IFS=, read SOURCE_ORG SOURCE_REPO DESTINATION_ORG DESTINATION_REPO
do 

  # Override for debugging
  if [ ! -z "${OVERRIDE_DESTINATION_ORG}" ]; then
    DESTINATION_ORG="${OVERRIDE_DESTINATION_ORG}"
  fi
  if [ ! -z "${OVERRIDE_DESTINATION_REPO_PREFIX}" ]; then
    DESTINATION_REPO="${OVERRIDE_DESTINATION_REPO_PREFIX}${DESTINATION_REPO}"
  fi

  # Create a "signature" for each repo based off its archive status, number of pull requests, number of discussions, numberr of 
  # releases, and whether the wiki is enabled.
  # Unfortunately we can't include the last push date as that's altered during migration, and the data size which seems to also
  # be slightly different after a normal migration (for reasons unknown to me)
  SOURCE_REPO_SIGNATURE=$(grep "^${SOURCE_REPO}," ./"${SOURCE_ORG}"-metrics/repo-metrics.csv | cut -d, -f3,4,7-10)
  DESTINATION_REPO_SIGNATURE=$(grep "^${DESTINATION_REPO}," ./"${DESTINATION_ORG}"-metrics/repo-metrics.csv | cut -d, -f3,4,7-10)
  
  if [[ "${SOURCE_REPO_SIGNATURE}" != "${DESTINATION_REPO_SIGNATURE}" ]]; then
    OUTPUT="FALSE"
  else
    OUTPUT="TRUE"
  fi
  OUTPUT="${OUTPUT},${SOURCE_ORG},${SOURCE_REPO},\"${SOURCE_REPO_SIGNATURE}\",${DESTINATION_ORG},${DESTINATION_REPO},\"${DESTINATION_REPO_SIGNATURE}\""
  echo "${OUTPUT}"
  echo "${OUTPUT}" >> "${OUTPUT_FILE}"
  
done < "${INPUT_FILE}"


cd "${STARTDIR}"
echo 
echo "Data files can be found here: ${TMPDIR}"

