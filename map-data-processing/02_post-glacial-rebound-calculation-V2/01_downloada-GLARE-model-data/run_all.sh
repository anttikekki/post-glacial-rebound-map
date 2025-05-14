#!/bin/bash

# Exit if any command fail
set -euo pipefail

FINAL_OUTPUT_FILE="Base-raster-tm35fin.tif"

if [ -f "$FINAL_OUTPUT_FILE" ]; then
    echo "Final result file $FINAL_OUTPUT_FILE exists, skipping 01_downloada-GLARE-model-data phase..."
    exit 0
fi

echo "Starting script execution..."

echo "1. Running 01_download-GLARE-model.sh..."
bash 01_download-GLARE-model.sh

echo "2. Running 02_reproject_to_tm35fin.sh..."
bash 02_reproject_to_tm35fin.sh

echo "All scripts executed successfully!"
