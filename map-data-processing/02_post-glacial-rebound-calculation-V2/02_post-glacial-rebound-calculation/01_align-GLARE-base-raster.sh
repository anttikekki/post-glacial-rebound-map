#!/bin/bash

set -euo pipefail

# This script warps and aligns the GLARE model base raster
# to match multiple input VRTs (DEM mosaics) in parallel.
# Output will be one compressed and tiled aligned raster per input VRT.

# Configurations
VRT_BASE_FOLDER="../../01_download-nls-elevation-model-2m/vrt"
GLARE_BASE_RASTER_SRC="../01_download-GLARE-model-data/Base-raster-tm35fin.tif"
OUTPUT_BASE_FOLDER="./aligned_GLARE_base_rasters"
PARALLEL_JOBS=8  # Number of parallel gdalwarp processes

# Create output base folder
mkdir -p "$OUTPUT_BASE_FOLDER"

# Input subfolders to process
INPUT_SUBFOLDERS=("whole-Finland" "coast-only")

# Check required source raster
if [ ! -f "$GLARE_BASE_RASTER_SRC" ]; then
    echo "Source GLARE base raster not found: $GLARE_BASE_RASTER_SRC"
    exit 1
fi

# Function to process a single VRT
process_vrt() {
    local VRT="$1"
    local INPUT_SUBDIR="$2"
    local BASENAME
    BASENAME=$(basename "$VRT" .vrt)

    local OUTPUT_DIR="${OUTPUT_BASE_FOLDER}/${INPUT_SUBDIR}"
    mkdir -p "$OUTPUT_DIR"

    local ALIGNED_OUTPUT="${OUTPUT_DIR}/${BASENAME}_GLARE_base_raster_aligned.tif"

    if [ -f "$ALIGNED_OUTPUT" ]; then
      echo "File $ALIGNED_OUTPUT exists, skipping..."
      return
    fi

    echo "Processing VRT: $BASENAME ($INPUT_SUBDIR)"

    local EXTENT
    EXTENT=$(gdalinfo "$VRT" | awk '
        /Lower Left/ {gsub("[(),]", "", $0); xmin=$3; ymin=$4}
        /Upper Right/ {gsub("[(),]", "", $0); xmax=$3; ymax=$4}
        END {print xmin, ymin, xmax, ymax}'
    )

    local SIZE
    SIZE=$(gdalinfo "$VRT" | awk '
        /Size is/ {gsub(",", "", $0); print $3, $4}'
    )

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
      "$GLARE_BASE_RASTER_SRC" "$ALIGNED_OUTPUT"

    echo "Finished: $ALIGNED_OUTPUT"
}

export -f process_vrt
export GLARE_BASE_RASTER_SRC OUTPUT_BASE_FOLDER

# Process all VRTs from both input folders
for SUBDIR in "${INPUT_SUBFOLDERS[@]}"; do
    INPUT_PATH="${VRT_BASE_FOLDER}/${SUBDIR}"
    
    if [ ! -d "$INPUT_PATH" ]; then
        echo "Input folder not found: $INPUT_PATH"
        continue
    fi

    find "$INPUT_PATH" -name "*.vrt" | xargs -n 1 -P "$PARALLEL_JOBS" bash -c 'process_vrt "$0" "'"$SUBDIR"'"'
done

echo "All VRTs processed."
