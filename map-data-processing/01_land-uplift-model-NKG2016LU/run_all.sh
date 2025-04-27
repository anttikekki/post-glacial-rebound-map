#!/bin/bash

# Exit if any command fail
set -euo pipefail

echo "Starting script execution..."

echo "1. Running 01_download_nkg2016lu_model.sh..."
bash 01_download_nkg2016lu_model.sh

echo "2. Running 02_convert_grid_to_csv.mjs..."
node 02_convert_grid_to_csv.mjs

echo "3. Running 03_extract_grid_metadata_from_csv.mjs..."
node 03_extract_grid_metadata_from_csv.mjs

echo "4. Running 04_process_grid_to_raster.sh..."
bash 04_process_grid_to_raster.sh

echo "5. Running 05_reproject_to_tm35fin.sh..."
bash 05_reproject_to_tm35fin.sh

echo "All scripts executed successfully!"
