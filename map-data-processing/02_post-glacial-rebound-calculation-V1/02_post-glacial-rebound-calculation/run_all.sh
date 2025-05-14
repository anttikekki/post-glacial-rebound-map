#!/bin/bash

# Exit on error
set -euo pipefail

# JSON file containing an array of years
YEAR_FILE="../../../common/mapLayerYears.json"

# Check that file exists
if [ ! -f "$YEAR_FILE" ]; then
    echo "Error: $YEAR_FILE not found."
    exit 1
fi

# Parse the JSON array into a Bash array using jq
YEARS=($(jq '.[]' "$YEAR_FILE"))

echo "------------------------------------------"
echo "Step 1: Aligning NKG2016LU raster..."
bash ./01_align_NKG2016LU.sh
echo "Alignment complete."
echo "------------------------------------------"

echo "Step 2: Running land uplift calculations..."
for YEAR in "${YEARS[@]}"; do
    echo "Running uplift for year: $YEAR"
    bash ./02_apply_height_change.sh "$YEAR"
done

echo "All uplift calculations completed."
