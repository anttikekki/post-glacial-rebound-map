#!/bin/bash

# Exit if any command fail
set -euo pipefail

# Base rsync URL
RSYNC_BASE_URL="rsync://tiedostot.kartat.kapsi.fi/mml/korkeusmalli/hila_2m/etrs-tm35fin-n2000"

# Local base target directory
TARGET_BASE_DIR="./mml/korkeusmalli/hila_2m/etrs-tm35fin-n2000"

# File containing list of folders to download
FOLDER_LIST_FILE="map-sheets-to-download.txt"

# Read folders into an array
mapfile -t FOLDERS < "$FOLDER_LIST_FILE"

# Make sure base directory exists
mkdir -p "$TARGET_BASE_DIR"

for folder in "${FOLDERS[@]}"; do
  echo "Downloading folder: $folder"
  
  rsync -avz --partial --progress \
    --include="*/" \
    --include="*.tif" \
    --exclude="*" \
    "${RSYNC_BASE_URL}/${folder}/" \
    "${TARGET_BASE_DIR}/${folder}/"
  
  echo "Finished downloading $folder!"
done

echo "All folders downloaded successfully!"
