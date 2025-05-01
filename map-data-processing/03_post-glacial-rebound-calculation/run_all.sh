#!/bin/bash

# Exit on error
set -euo pipefail

# Input file with list of years
YEAR_FILE="calculation-years.txt"

# Check that required files exist
if [ ! -f "$YEAR_FILE" ]; then
    echo "Error: $YEAR_FILE not found."
    exit 1
fi

echo "------------------------------------------"
echo "Step 1: Aligning NKG2016LU raster..."
bash ./01_align_NKG2016LU.sh
echo "Alignment complete."
echo "------------------------------------------"

echo "Step 2: Running land uplift calculations..."
while IFS= read -r YEAR; do
    # Skip empty lines or comments
    [[ -z "$YEAR" || "$YEAR" =~ ^# ]] && continue
    echo "Running uplift for year: $YEAR"
    bash ./02_apply_height_change.sh "$YEAR"
done < "$YEAR_FILE"

echo "All uplift calculations completed."
