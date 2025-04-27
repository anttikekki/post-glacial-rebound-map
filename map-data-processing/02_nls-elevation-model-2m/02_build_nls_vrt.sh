#!/bin/bash

# Exit if any command fail
set -euo pipefail

# build_nls_vrts_by_subfolder.sh
# This script builds a separate VRT (Virtual Raster Tile) mosaic for each subfolder
# inside the Finnish NLS Elevation Model 2m base directory.
# A VRT is a lightweight XML file that references many individual raster files and acts like a single mosaic raster.

BASE_INPUT_FOLDER="./mml/korkeusmalli/hila_2m/etrs-tm35fin-n2000"
OUTPUT_FOLDER="./vrt"

# Create output folder if it doesn't exist
mkdir -p "$OUTPUT_FOLDER"

# Check if input folder exists
if [ ! -d "$BASE_INPUT_FOLDER" ]; then
    echo "Input folder does not exist: $BASE_INPUT_FOLDER"
    exit 1
fi

# Find all first-level subfolders
echo "Searching for subfolders under $BASE_INPUT_FOLDER..."

for SUBFOLDER in "$BASE_INPUT_FOLDER"/*/; do
    # Skip if not a directory
    if [ ! -d "$SUBFOLDER" ]; then
        continue
    fi

    # Get clean subfolder name (without path)
    SUBFOLDER_NAME=$(basename "$SUBFOLDER")
    VRT_OUTPUT="$OUTPUT_FOLDER/${SUBFOLDER_NAME}.vrt"

    # Remove old VRT if it exists
    if [ -f "$VRT_OUTPUT" ]; then
        echo "🗑️  Removing existing VRT: $VRT_OUTPUT"
        rm "$VRT_OUTPUT"
    fi

    echo "Building VRT for subfolder: $SUBFOLDER_NAME"

    TIFF_FILES=$(find "$SUBFOLDER" -type f \( -iname "*.tif" -o -iname "*.tiff" \))

    if [ -z "$TIFF_FILES" ]; then
        echo "No TIFF files found in $SUBFOLDER, skipping..."
        continue
    fi

    # Build VRT for this subfolder
    gdalbuildvrt \
        -vrtnodata -9999 \
        -srcnodata -9999 \
        -hidenodata \
        "$VRT_OUTPUT" $TIFF_FILES

    echo "VRT created: $VRT_OUTPUT"
done

echo "All subfolders processed!"
