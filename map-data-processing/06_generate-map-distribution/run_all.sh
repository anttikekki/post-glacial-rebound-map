#!/bin/bash

# Exit if any command fail
set -euo pipefail

if [ $# -lt 2 ]; then
    echo "Usage: $0 SOURCE SOURCE_VERSION [YEAR1 YEAR2 ...]"
    echo "SOURCE must be one of: MASK, COLORIZED"
    echo "Calculation source data SOURCE_VERSION must be one of: V1, V2"
    echo "Optional YEAR values can be provided to process specific years."
    exit 1
fi

SOURCE="$1"
SOURCE_VERSION="$2"
shift  # Remove SOURCE from the list of positional arguments
shift  # Remove SOURCE_VERSION from the list of positional arguments

echo "Starting script execution..."

echo "1. Running 01_generate_Cloud-Optimized-GeoTIFFs.sh..."
bash 01_generate_Cloud-Optimized-GeoTIFFs.sh "$SOURCE" "$SOURCE_VERSION" "$@"

echo "All scripts executed successfully!"
