#!/bin/bash

# Exit if any command fail
set -euo pipefail

if [ $# -lt 1 ]; then
    echo "Usage: $0 SOURCE [YEAR1 YEAR2 ...]"
    echo "SOURCE must be one of: MASK, COLORIZED"
    echo "Optional YEAR values can be provided to process specific years."
    exit 1
fi

SOURCE="$1"
shift  # Remove SOURCE from the list of positional arguments

echo "Starting script execution..."

echo "1. Running 01_generate_Cloud-Optimized-GeoTIFFs.sh..."
bash 01_generate_Cloud-Optimized-GeoTIFFs.sh "$SOURCE" "$@"

echo "All scripts executed successfully!"
