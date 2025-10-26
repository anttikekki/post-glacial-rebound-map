#!/bin/bash

# Exit if any command fails
set -euo pipefail

# --- Define source and target paths ---
MAIN_SRC="../../map-data-processing/06_generate-map-distribution/result_cog"
MAIN_DEST="r2:post-glacial-rebound-data/V2"

# Dry run for main land uplift map sync
echo "Running dry run for main sync..."
rclone sync "$MAIN_SRC" "$MAIN_DEST" --include "*.tif" --dry-run --progress --max-depth 1

# dry run for icev map sync
ICE_SRC="../../map-data-processing/02_post-glacial-rebound-calculation/03_ice_mask_calculation/result_cog"
ICE_DEST="r2:post-glacial-rebound-data/V2/ice"
echo ""
echo "Running dry run for ice mask sync..."
rclone sync "$ICE_SRC" "$ICE_DEST" --include "*.tif" --dry-run --progress --max-depth 1

# Ask for user confirmation
echo ""
read -p "Do you want to proceed with the actual sync? (y/n): " CONFIRM
case "$CONFIRM" in
  [yY][eE][sS]|[yY])
    echo "Starting sync..."
    rclone sync "$MAIN_SRC" "$MAIN_DEST" --include "*.tif" --progress --max-depth 1
    rclone sync "$ICE_SRC" "$ICE_DEST" --include "*.tif" --progress --max-depth 1
    echo "Sync completed."
    ;;
  *)
    echo "Sync cancelled by user."
    exit 0
    ;;
esac
