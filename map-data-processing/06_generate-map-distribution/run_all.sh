#!/bin/bash

# Exit if any command fail
set -euo pipefail

# --- Parse input argument ---
if [ $# -ne 1 ]; then
    echo "Usage: $0 SOURCE"
    echo "SOURCE must be one of: MASK, COLORIZED"
    exit 1
fi

SOURCE="$1"

echo "Starting script execution..."

echo "1. Running 01_generate_Cloud-Optimized-GeoTIFFs.sh..."
bash 01_generate_Cloud-Optimized-GeoTIFFs.sh "$SOURCE"

echo "All scripts executed successfully!"
