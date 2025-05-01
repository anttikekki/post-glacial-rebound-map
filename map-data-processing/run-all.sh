#!/bin/bash
set -euo pipefail

echo "Executing scripts..."
echo "-------------------------------------"

run_script() {
    DIR="$1"
    echo "Running: $DIR/run_all.sh"
    pushd "$DIR" > /dev/null

    # Run script in a subshell so its exit won't stop this master script
    if ! ./run_all.sh; then
        echo "Script in $DIR failed (but continuing)"
    else
        echo "Script in $DIR completed"
    fi

    popd > /dev/null
    echo ""
}

run_script "01_land-uplift-model-NKG2016LU"
run_script "02_nls-elevation-model-2m"
run_script "03_post-glacial-rebound-calculation"
run_script "04_sea-level-mask-calculation"
run_script "06_generate-map-distribution"

echo "All subfolder scripts attempted."
