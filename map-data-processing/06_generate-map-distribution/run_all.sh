#!/bin/bash

# Exit if any command fail
set -euo pipefail

echo "Starting script execution..."

echo "1. Running 01_generate_Cloud-Optimized-GeoTIFFs.sh..."
bash 01_generate_Cloud-Optimized-GeoTIFFs.sh

echo "All scripts executed successfully!"
