#!/bin/bash

# Exit on error, undefined variables, or failed pipes
set -euo pipefail

# JSON file containing an array of years
YEAR_FILE="../../../common/seaMapLayerYears.json"

# Determine whether to use CLI args or JSON file
if [ "$#" -gt 0 ]; then
    # Use CLI arguments as years
    YEARS=("$@")
    echo "Using years from command-line: ${YEARS[*]}"
else
    # Use JSON file
    if [ ! -f "$YEAR_FILE" ]; then
        echo "Error: $YEAR_FILE not found."
        exit 1
    fi
    YEARS=($(jq '.[]' "$YEAR_FILE"))
    echo "Using years from JSON file: $YEAR_FILE"
fi

echo "Step 1: Aligning GLARE Base raster..."
bash ./01_align-GLARE-base-raster.sh
echo "Alignment complete."

echo "Step 2: Running land uplift calculations..."
for YEAR in "${YEARS[@]}"; do
    echo "Running uplift for year: $YEAR"
    bash ./02_run_glare_model.sh "$YEAR"
done

echo "All uplift calculations completed."
