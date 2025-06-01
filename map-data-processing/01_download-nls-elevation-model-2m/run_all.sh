#!/bin/bash

# Exit if any command fail
set -euo pipefail

echo "Starting script execution..."

echo "1. Running 01_download_elevation_model.sh..."
bash 01_download_elevation_model.sh

echo "2. Running 02_build_nls_vrt.sh..."
bash 02_build_nls_vrt.sh

echo "All scripts executed successfully!"
