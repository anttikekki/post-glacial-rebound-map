#!/bin/bash

# Exit if any command fail
set -euo pipefail

# build_nls_vrt.sh
# This script automatically builds a VRT (Virtual Raster Tile) mosaic from all GeoTIFF files
# inside the Finnish NLS Elevation Model 2m data directory.
# A VRT is a lightweight XML file that references many individual raster files and acts like a single mosaic raster.

# Fixed input folder and output VRT file
INPUT_FOLDER="./mml/korkeusmalli/hila_2m/etrs-tm35fin-n2000"
OUTPUT_VRT="nls-elevation-model-2m.vrt"

# Check if input folder exists
if [ ! -d "$INPUT_FOLDER" ]; then
    echo "Input folder does not exist: $INPUT_FOLDER"
    exit 1
fi

# Remove old VRT file if it exists
if [ -f "$OUTPUT_VRT" ]; then
    echo "Removing existing VRT file: $OUTPUT_VRT"
    rm "$OUTPUT_VRT"
fi

# Find all .tif and .tiff files recursively
echo "🔍 Searching for GeoTIFF files under $INPUT_FOLDER..."
TIFF_FILES=$(find "$INPUT_FOLDER" -type f \( -iname "*.tif" -o -iname "*.tiff" \))

# Check if any files found
if [ -z "$TIFF_FILES" ]; then
    echo "No TIFF files found in $INPUT_FOLDER."
    exit 1
fi

# Build VRT
echo "🛠️  Building VRT file: $OUTPUT_VRT..."
gdalbuildvrt \
    -vrtnodata -9999 \
    -srcnodata -9999 \
    -hidenodata \
    "$OUTPUT_VRT" $TIFF_FILES

echo "VRT created successfully: $OUTPUT_VRT"
