#!/bin/bash

# Exit if any command fail
set -euo pipefail

SOURCE_VERSION="$1"
shift  # Remove SOURCE_VERSION from the list of positional arguments

echo "Starting script execution..."

echo "1. Running 01_generate_sea_land_mask.sh..."
bash 01_generate_sea_land_mask.sh "$@"

echo "All scripts executed successfully!"
