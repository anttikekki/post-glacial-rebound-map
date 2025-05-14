#!/bin/bash

# Exit if any command fails
set -euo pipefail

# This script warps and aligns the NKG2016LU raster
# to match multiple input VRTs (DEM mosaics) in parallel.
# Output will be one compressed and tiled aligned raster per input VRT.

# Configurations
VRT_FOLDER="../../01_download-nls-elevation-model-2m/vrt"
NKG2016LU_SRC="../01_download-land-uplift-model-NKG2016LU/NKG2016LU_lev_tm35fin.tif"
OUTPUT_FOLDER="./aligned_NKG2016LU_rasters"
PARALLEL_JOBS=8  # Number of parallel gdalwarp processes

# Create output folder if it doesn't exist
mkdir -p "$OUTPUT_FOLDER"

# Check if input files exist
if [ ! -d "$VRT_FOLDER" ]; then
    echo "VRT folder not found: $VRT_FOLDER"
    exit 1
fi

if [ ! -f "$NKG2016LU_SRC" ]; then
    echo "Source NKG2016LU raster not found: $NKG2016LU_SRC"
    exit 1
fi

# Function to process a single VRT
process_vrt() {
    local VRT="$1"
    local BASENAME
    BASENAME=$(basename "$VRT" .vrt)
    local ALIGNED_OUTPUT="$OUTPUT_FOLDER/${BASENAME}_NKG2016LU_aligned.tif"

    if [ -f "$ALIGNED_OUTPUT" ]; then
      echo "File $ALIGNED_OUTPUT exists, skipping..."
      return
    fi

    echo "Processing VRT: $BASENAME"

    # Extract extent from VRT
    local EXTENT
    EXTENT=$(gdalinfo "$VRT" | awk '
        /Lower Left/ {gsub("[(),]", "", $0); xmin=$3; ymin=$4}
        /Upper Right/ {gsub("[(),]", "", $0); xmax=$3; ymax=$4}
        END {print xmin, ymin, xmax, ymax}'
    )

    # Extract raster size from VRT
    local SIZE
    SIZE=$(gdalinfo "$VRT" | awk '
        /Size is/ {gsub(",", "", $0); print $3, $4}'
    )

    # Debug: Print extracted values
    echo "Extracted Extent: $EXTENT"
    echo "Extracted Size: $SIZE"

    echo "Running gdalwarp for $BASENAME..."
    gdalwarp -overwrite \
      -r near \
      -t_srs EPSG:3067 \
      -te $EXTENT \
      -ts $SIZE \
      -co COMPRESS=DEFLATE \
      -co PREDICTOR=2 \
      -co ZLEVEL=9 \
      -co TILED=YES \
      "$NKG2016LU_SRC" "$ALIGNED_OUTPUT"

    echo "Finished: $ALIGNED_OUTPUT"
}

export -f process_vrt
export NKG2016LU_SRC OUTPUT_FOLDER

# Find all VRTs and process them in parallel using xargs
find "$VRT_FOLDER" -name "*.vrt" | xargs -n 1 -P "$PARALLEL_JOBS" bash -c 'process_vrt "$0"' 

echo "All VRTs processed."
