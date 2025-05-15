#!/bin/bash

# Exit if any command fail
set -euo pipefail

# --- Parse input argument ---
if [ $# -ne 1 ]; then
    echo "Usage: $0 SOURCE_VERSION"
    echo "Calculation source data SOURCE_VERSION must be one of: V1, V2"
    exit 1
fi

SOURCE_VERSION="$1"

echo "Starting script execution..."

echo "1. Running 01_colorize_sea_land_mask.sh..."
bash 01_colorize_sea_land_mask.sh "$SOURCE_VERSION"

echo "All scripts executed successfully!"
