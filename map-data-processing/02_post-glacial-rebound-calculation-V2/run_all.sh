#!/bin/bash

# Exit if any command fail
set -euo pipefail

run_script() {
    DIR="$1"
    echo "Running: $DIR/run_all.sh"
    pushd "$DIR" > /dev/null
   ./run_all.sh
    popd > /dev/null
    echo "Script in $DIR completed"
}

echo "Starting 02_post-glacial-rebound-calculation-V2 script execution..."

run_script "01_download-GLARE-model-data"
run_script "02_post-glacial-rebound-calculation"
run_script "03_ice_mask_calculation"

echo "All scripts in 02_post-glacial-rebound-calculation-V2 executed successfully!"
