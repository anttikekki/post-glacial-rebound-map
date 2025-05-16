#!/bin/bash
set -euo pipefail

echo "Executing V1 scripts..."
echo "-------------------------------------"

run_script() {
    DIR="$1"
    EXTRA_ARG_1="${2:-}"  # Optional second parameter
    EXTRA_ARG_2="${3:-}"  # Optional third parameter
    echo "Running: $DIR/run_all.sh $EXTRA_ARG_1 $EXTRA_ARG_2"
    pushd "$DIR" > /dev/null
    ./run_all.sh $EXTRA_ARG_1 $EXTRA_ARG_2
    popd > /dev/null
    echo "Script in $DIR completed"
}

run_script "01_download-nls-elevation-model-2m"
run_script "02_post-glacial-rebound-calculation-V1"
run_script "04_sea-level-mask-calculation" "V1"
run_script "06_generate-map-distribution" "MASK" "V1"

echo "All V1 scripts executed."
