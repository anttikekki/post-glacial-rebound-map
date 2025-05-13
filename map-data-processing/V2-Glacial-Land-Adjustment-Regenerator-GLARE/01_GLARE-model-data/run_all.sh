#!/bin/bash

# Exit if any command fail
set -euo pipefail

echo "Starting script execution..."

echo "1. Running 01_download-GLARE-model.sh..."
bash 01_download-GLARE-model.sh

echo "2. Running 02_reproject_to_tm35fin.sh..."
bash 02_reproject_to_tm35fin.sh

echo "All scripts executed successfully!"
