#!/bin/bash

# Exit if any command fail
set -euo pipefail

echo "Starting script execution..."

echo "1. Running 01_crop_single_pixel_rasters.sh.."
bash 01_crop_single_pixel_rasters.sh

echo "2. Running 02_run_glare_calculations.sh..."
bash 02_run_glare_calculations.sh

echo "All scripts executed successfully!"
