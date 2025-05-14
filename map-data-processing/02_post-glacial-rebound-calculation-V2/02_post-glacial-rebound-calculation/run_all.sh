#!/bin/bash

# Exit if any command fail
set -euo pipefail

echo "Starting script execution..."

echo "1. Running 01_align-GLARE-base-raster.sh..."
bash 01_align-GLARE-base-raster.sh

echo "2. Running 02_run_glare_model.sh..."
bash 02_run_glare_model.sh

echo "All scripts executed successfully!"
