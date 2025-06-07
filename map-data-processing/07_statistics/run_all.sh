#!/bin/bash

# Exit if any command fail
set -euo pipefail


if [ $# -lt 1 ]; then
    echo "Usage: $0 SOURCE_VERSION"
    echo "Calculation source data SOURCE_VERSION must be one of: V1, V2"
    exit 1
fi

SOURCE_VERSION="$1"

case "$SOURCE_VERSION" in
  V1|V2)
    # Valid values, continue
    ;;
  *)
    echo "Error: Invalid SOURCE_VERSION value: '$SOURCE_VERSION'" >&2
    echo "Valid options are: V1 or V2" >&2
    exit 1
    ;;
esac

echo "Starting script execution..."

echo "1. Running 01_collect_elevations.sh..."
bash 01_collect_elevations.sh "$SOURCE_VERSION"

echo "2. Running 02_calculate_deltas.js..."
node 02_calculate_deltas.js "$SOURCE_VERSION"

echo "3. 03_combine_results_to_csv.sh..."
bash 03_combine_results_to_csv.sh "$SOURCE_VERSION"

echo "All scripts executed successfully!"
