#!/bin/bash

# Exit if any command fails
set -euo pipefail

# --- Parse input argument ---
if [ $# -ne 1 ]; then
    echo "Usage: $0 SOURCE_VERSION"
    echo "Calculation source data SOURCE_VERSION must be one of: V1, V2"
    exit 1
fi

SOURCE_VERSION="$1"

case "$SOURCE_VERSION" in
  V1|V2)
    # Valid values, continue
    ;;
  *)
    echo "Error: Invalid SOURCE_VERSION value: '$SOURCE_VERSION'" >&2
    echo "Valid options are: V1 or V2" >&2
    exit 1
    ;;
esac

# --- Define source and target paths ---
MAIN_SRC="../../map-data-processing/06_generate-map-distribution/result_cog/$SOURCE_VERSION"
MAIN_DEST="r2:post-glacial-rebound-data/$SOURCE_VERSION"

# Dry run for main sync
echo "Running dry run for main sync..."
rclone sync "$MAIN_SRC" "$MAIN_DEST" --include "*.tif" --dry-run --progress --max-depth 1

# If V2, dry run for additional sync
if [ "$SOURCE_VERSION" = "V2" ]; then
  ICE_SRC="../../map-data-processing/02_post-glacial-rebound-calculation-V2/03_ice_mask_calculation/result_cog"
  ICE_DEST="r2:post-glacial-rebound-data/V2/ice"
  echo ""
  echo "Running dry run for V2 ice mask sync..."
  rclone sync "$ICE_SRC" "$ICE_DEST" --include "*.tif" --dry-run --progress --max-depth 1
fi

# Ask for user confirmation
echo ""
read -p "Do you want to proceed with the actual sync? (y/n): " CONFIRM
case "$CONFIRM" in
  [yY][eE][sS]|[yY])
    echo "Starting sync..."
    rclone sync "$MAIN_SRC" "$MAIN_DEST" --include "*.tif" --progress --max-depth 1

    if [ "$SOURCE_VERSION" = "V2" ]; then
      rclone sync "$ICE_SRC" "$ICE_DEST" --include "*.tif" --progress --max-depth 1
    fi
    echo "Sync completed."
    ;;
  *)
    echo "Sync cancelled by user."
    exit 0
    ;;
esac
