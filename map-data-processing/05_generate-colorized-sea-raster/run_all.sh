#!/bin/bash

# Exit if any command fail
set -euo pipefail

echo "Starting script execution..."

echo "1. Running 01_colorize_sea_land_mask.sh..."
bash 01_colorize_sea_land_mask.sh

echo "All scripts executed successfully!"
