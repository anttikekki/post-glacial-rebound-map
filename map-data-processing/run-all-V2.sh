#!/bin/bash
set -euo pipefail

echo "Executing V2 scripts..."

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

# Run steps
run_script "01_download-nls-elevation-model-2m"
run_script "02_post-glacial-rebound-calculation-V2" "${YEAR_ARGS[@]}"
run_script "04_sea-level-mask-calculation" "V2"
run_script "06_generate-map-distribution" "MASK" "V2"

echo "All V2 scripts executed."
