#!/bin/bash
set -euo pipefail

echo "Executing V1 scripts..."

# Capture all optional year arguments (if any)
YEAR_ARGS=("$@")

run_script() {
    local DIR="$1"
    shift
    local EXTRA_ARGS=("$@")
    echo "Running: $DIR/run_all.sh $*"
    pushd "$DIR" > /dev/null
    ./run_all.sh "$@"
    popd > /dev/null
    echo "Script in $DIR completed"
}

run_script "01_download-nls-elevation-model-2m"
run_script "02_post-glacial-rebound-calculation-V1" "${YEAR_ARGS[@]}"
run_script "04_sea-level-mask-calculation" "V1"
run_script "06_generate-map-distribution" "MASK" "V1"

echo "All V1 scripts executed."
