#!/bin/bash

# Exit if any command in a pipeline fails
set -euo pipefail

echo "Starting script execution..."

echo "1. Running 01_download_nkg2016lu_model.sh..."
bash 01_download_nkg2016lu_model.sh

echo "2. Running 02_convert_grid_to_csv.mjs..."
node 02_convert_grid_to_csv.mjs

echo "3. Running 03_process_grid_to_raster.sh..."
bash 03_process_grid_to_raster.sh

echo "4. Running 04_reproject_to_tm35fin.sh..."
bash 04_reproject_to_tm35fin.sh

echo "All scripts executed successfully! 🎉"
