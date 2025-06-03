#!/bin/bash

# Exit if any command fail
set -euo pipefail

if [ "$#" -lt 1 ]; then
    echo "Usage: $0 SOURCE_VERSION [YEAR1 YEAR2 ...]"
    echo "SOURCE_VERSION must be one of: V1, V2"
    echo "Optional YEAR values can be provided to process specific years."
    exit 1
fi

SOURCE_VERSION="$1"
shift  # Remove SOURCE_VERSION from the list of positional arguments
YEAR_OVERRIDE="$*"

echo "Starting script execution..."

echo "1. Running 01_generate_sea_land_mask.sh..."
bash 01_generate_sea_land_mask.sh "$SOURCE_VERSION" "$YEAR_OVERRIDE"

echo "All scripts executed successfully!"
