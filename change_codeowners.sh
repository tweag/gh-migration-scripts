#!/usr/bin/bash
# set -x
set -o igncr

####################

separator() {
    echo
    echo "###########################"
    echo
}

####################

SED_FILE=''
TEMP_DIR=$(mktemp -d)
INPUT_FILE=""

option_s=0
option_o=0
option_t=0
option_p=0

####################

usage() {
    separator

    echo "Description: is used to change CODEOWNER on all repos inside one Organization."
    echo
    echo "  -s: SED script file."
    echo "  -i: Input CSV with repos to update, NO HEADER, columns: organiztaion,repository"
    echo "  -t: Temporary directory that will be used to clone all repositories."
    echo "  -n: Username for a commit message if CODEOWNERS is updated"
    echo "  -e: Email address for a commit message if CODEOWNERS is updated"
    echo "  -h: show this usage"
    echo
    echo "You must create personal access tokens that can access the source organizations, "
    echo "then set the personal access tokens as environment variables (GH_PAT)."
    echo
    echo "Read more about this: https://tinyurl.com/3pzbw4cp"
    echo
    exit
}

exit_abnormal() {
  usage
  exit 1
}

validate_option_arg() {
  local opt="$1"
  local arg="$2"
  local next_arg="$3"

  if [[ -z "$arg" ]]; then
    echo "Error: -${opt} requires an argument." 1>&2
    exit_abnormal
  elif [[ ${arg:0:1} == "-" ]]; then
    echo ""Error: -${opt} requires an valid argument."" 1>&2
    exit_abnormal
  elif [[ -n "$next_arg" && ${next_arg:0:1} != "-" ]]; then
    echo ""Error: -${opt} has a invalid argument."" 1>&2
    exit_abnormal
  fi
}

####################

main() {
    echo "Starting script to change CODEOWNERs.."

    echo "Creating temporary dir at ${TEMP_DIR}.."
    mkdir -p $TEMP_DIR
    cd $TEMP_DIR
    
	while IFS=, read ORG_NAME repo_name
    do
				
		# The CODEOWNERS file might live in the .github, root, or docs directory. :( 
		for directory in ".github/" "" "docs/"; do

			temp_file=$(mktemp)
			echo "[INFO] ${ORG_NAME}/${repo_name}/${directory}CODEOWNERS temp file: ${temp_file}"
	
			gh api -H "Accept: application/vnd.github+json" -H "X-GitHub-Api-Version: 2022-11-28" repos/${ORG_NAME}/${repo_name}/contents/${directory}CODEOWNERS -q ".sha,.content" > "${temp_file}"
			tail -n +2 $temp_file | base64 -d > "${temp_file}.decoded"
			
			# See if our temp file has anything or not
			if [ -s "$temp_file.decoded" ]; then
				# OK, it does.  Time to push it back up.
				sed -i.bak -f ${SED_FILE} "${temp_file}.decoded"
				# Was a new file created?
				if [ -s $temp_file.decoded ]; then
					# Does it differ from the original?
					if ! diff -w "${temp_file}.decoded" "${temp_file}.decoded.bak"; then
						gh api --method PUT -H "Accept: application/vnd.github+json" -H "X-GitHub-Api-Version: 2022-11-28" repos/${ORG_NAME}/${repo_name}/contents/${directory}CODEOWNERS -f "message=update codeowners" -f "committer[name]=${COMMIT_USERNAME}" -f "committer[email]=${COMMIT_EMAIL}" -f "content=$(base64 -w 0 $temp_file.decoded)" -f "sha=$(head -n 1 $temp_file)"
						if [ $? -eq 0 ]; then
							echo "[INFO] Updated ${directory}CODEOWNERS for ${ORG_NAME}/${repo_name}"
						else
							echo "[ERROR] FAILED updating ${directory}CODEOWNERS for ${ORG_NAME}/${repo_name}"
						fi
					fi
				else
					echo "[ERROR] We somehow created a non-existant or zero-byte CODEOWNERS file. $temp_file"
					exit 1
				fi

			else
				echo "[INFO] ${ORG_NAME}/${repo_name} does not have a ${directory}CODEOWNERS file, skipping $temp_file.. " 
			fi
		done

        separator
    done < $INPUT_FILE

    echo "Finished script!"
}

####################

while getopts ":s:i:t:n:e:h" opt; do
    case ${opt} in
        s)
            validate_option_arg "$opt" "$OPTARG" "${!OPTIND}"

            if [ "${OPTARG##*.}" != "txt" ]; then
                echo "Error: file ${OPTARG} does not have .txt extension. This is necessary to execute sed command." 1>&2
                exit_abnormal
            fi
            SED_FILE="${OPTARG}"
            option_s=1
            ;;
        i)
            validate_option_arg "$opt" "$OPTARG" "${!OPTIND}"

            INPUT_FILE="${OPTARG}"
            option_i=1
            ;;
        t)
            validate_option_arg "$opt" "$OPTARG" "${!OPTIND}"

            TEMP_DIR="${OPTARG}"
            option_t=1
            ;;
		n)
            COMMIT_USERNAME="${OPTARG}"
            option_n=1
            ;;
		e)
            COMMIT_EMAIL="${OPTARG}"
            option_e=1
            ;;			
        h)
            usage
            ;;
        \?)
            echo "Invalid option: -$OPTARG" >&2
            exit_abnormal
            ;;
        :)
            echo "Error: -${OPTARG} requires an argument."
            exit_abnormal
            ;;
    esac
done
shift $((OPTIND -1))


if [ -z "${GITHUB_TOKEN}" ]; then
    echo "GITHUB_TOKEN is unset or set to the empty string"
fi

if [[ $option_s -eq 0 ]]; then
    echo "Options -s (sed script file) is required." 1>&2
    exit_abnormal
fi

if [[ $option_i -eq 0 ]]; then
    echo "Options -i (input CSV file name) is required." 1>&2
    exit_abnormal
fi

if [[ $option_e -eq 0 ]]; then
    echo "Options -e (Committer email address) is required." 1>&2
    exit_abnormal
fi

if [[ $option_n -eq 0 ]]; then
    echo "Options -n (Committer username) is required." 1>&2
    exit_abnormal
fi

time main
