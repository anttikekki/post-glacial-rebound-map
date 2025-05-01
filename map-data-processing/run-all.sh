#!/bin/bash

# Exit on error
set -euo pipefail

# List of relative script paths to execute
SCRIPTS=(
  "01_land-uplift-model-NKG2016LU/run_all.sh"
  "02_nls-elevation-model-2m/run_all.sh"
  "03_post-glacial-rebound-calculation/run_all.sh"
  "04_sea-level-mask-calculation/run_all.sh"
  "06_generate-map-distribution/run_all.sh"
)

echo "Executing scripts."
echo "-------------------------------------"

for SCRIPT_PATH in "${SCRIPTS[@]}"; do
    SCRIPT_DIR=$(dirname "$SCRIPT_PATH")
    SCRIPT_FILE=$(basename "$SCRIPT_PATH")

    echo "Running: $SCRIPT_PATH"
    pushd "$SCRIPT_DIR" > /dev/null

    if [ ! -x "$SCRIPT_FILE" ]; then
        echo "Error: $SCRIPT_FILE is not executable or not found."
        popd > /dev/null
        exit 1
    fi

    ./"$SCRIPT_FILE"

    popd > /dev/null
    echo ""
done

echo "All subfolder scripts executed."
