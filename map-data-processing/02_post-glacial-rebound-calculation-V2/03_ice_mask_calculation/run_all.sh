#!/bin/bash

# Exit if any command fail
set -euo pipefail

echo "Starting script execution..."

echo "1. Running 01_set-base-raster-nodata-value.sh..."
bash 01_set-base-raster-nodata-value.sh

echo "2. Running 02_calculate-ice-presence-mask.sh..."
bash 02_calculate-ice-presence-mask.sh

echo "3. Running 03_generate_Cloud-Optimized-GeoTIFFs.sh..."
bash 03_generate_Cloud-Optimized-GeoTIFFs.sh

echo "All scripts executed successfully!"
