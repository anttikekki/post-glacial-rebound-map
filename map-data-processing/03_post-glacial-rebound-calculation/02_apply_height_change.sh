#!/bin/bash

# Exit if any command fails
set -euo pipefail

# This script applies NKG2016LU land uplift change to DEM base rasters
# by matching VRT base DEMs and aligned change rasters.
# It runs gdal_calc.py in parallel with compression options and outputs compressed GeoTIFFs.

# Configurations
BASE_DEM_FOLDER="../02_nls-elevation-model-2m/vrt"          # Folder with VRTs
CHANGE_FOLDER="./aligned_NKG2016LU_rasters"                 # Folder with aligned NKG2016LU rasters
OUTPUT_ROOT_FOLDER="./uplifted_DEMs"                        # Root output folder
PARALLEL_JOBS=8                                             # Number of parallel gdal_calc processes

# Check arguments
if [ $# -ne 1 ]; then
    echo "Usage: $0 years"
    echo "Example: $0 1000   (simulate 1000 years into future)"
    echo "Example: $0 -1000  (simulate 1000 years into past)"
    exit 1
fi

YEARS="$1"

# Define output folder for this specific year
OUTPUT_FOLDER="$OUTPUT_ROOT_FOLDER/$YEARS"

# Create output folder if it doesn't exist
mkdir -p "$OUTPUT_FOLDER"

echo "Years parameter for calculations: $YEARS"
echo "Output folder: $OUTPUT_FOLDER"

# Function to process a single VRT and matching change raster
process_pair() {
    local VRT="$1"
    local BASENAME=$(basename "$VRT" .vrt)
    local CHANGE_RASTER="$CHANGE_FOLDER/${BASENAME}_NKG2016LU_aligned.tif"
    local OUTPUT="$OUTPUT_FOLDER/${BASENAME}_uplifted_${YEARS}y.tif"

    if [ -f "$OUTPUT" ]; then
      echo "File $OUTPUT exists, skipping..."
      return
    fi

    echo "Processing DEM: $BASENAME"

    if [ ! -f "$CHANGE_RASTER" ]; then
        echo "Warning: No matching change raster for $BASENAME, skipping."
        return
    fi

    # Perform calculation and directly compress output
    gdal_calc \
      -A "$VRT" \
      -B "$CHANGE_RASTER" \
      --outfile="$OUTPUT" \
      --calc="A + ((B * $YEARS) / 1000.0)" \
      --type=Float32 \
      --overwrite \
      --co COMPRESS=DEFLATE \
      --co PREDICTOR=2 \
      --co ZLEVEL=9 \
      --co TILED=YES \
      --co BLOCKXSIZE=256 \
      --co BLOCKYSIZE=256 \
      --co BIGTIFF=YES

    echo "Finished: $OUTPUT"
}

export -f process_pair
export CHANGE_FOLDER OUTPUT_FOLDER YEARS

# Find all VRTs and run them in parallel
find "$BASE_DEM_FOLDER" -name "*.vrt" | xargs -n 1 -P "$PARALLEL_JOBS" bash -c 'process_pair "$0"'

echo "All DEMs processed."
