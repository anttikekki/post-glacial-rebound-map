#!/bin/bash

# Exit if any command fails
set -euo pipefail

# This script applies NKG2016LU land uplift change to NLS elevation model
# using calendar years (e.g. -500 = 500 BC, 2025 = future).
# Uplift is calculated relative to the reference year 2023.

# Configurations
BASE_DEM_FOLDER="../../01_download-nls-elevation-model-2m/vrt"          # Folder with VRTs
CHANGE_FOLDER="./aligned_NKG2016LU_rasters"                 # Folder with aligned NKG2016LU rasters
OUTPUT_ROOT_FOLDER="./calculation_results"                  # Root output folder
REFERENCE_YEAR=2023                                         # Source data is from this year
PARALLEL_JOBS=8                                             # Number of parallel gdal_calc processes

# Check argument
if [ $# -ne 1 ]; then
    echo "Usage: $0 CALENDAR_YEAR"
    echo "Example: $0 1000    (simulate year 1000 AD)"
    echo "Example: $0 -500    (simulate 500 BC)"
    echo "Example: $0 2025    (simulate 2 years into future, because height data is from 2023)"
    exit 1
fi

CALENDAR_YEAR="$1"
YEARS=$(($CALENDAR_YEAR - $REFERENCE_YEAR))

# Define output folder for year
OUTPUT_FOLDER="$OUTPUT_ROOT_FOLDER/$CALENDAR_YEAR"

# Create output folder if it doesn't exist
mkdir -p "$OUTPUT_FOLDER"

echo "Target calendar year: $CALENDAR_YEAR"
echo "Reference year: $REFERENCE_YEAR"
echo "Years of change: $YEARS"
echo "Output folder: $OUTPUT_FOLDER"

# Function to process a single VRT and matching NKG2016LU raster
process_pair() {
    local VRT="$1"
    local BASENAME=$(basename "$VRT" .vrt)
    local CHANGE_RASTER="$CHANGE_FOLDER/${BASENAME}_NKG2016LU_aligned.tif"
    local OUTPUT="$OUTPUT_FOLDER/${BASENAME}_uplifted_${CALENDAR_YEAR}.tif"

    if [ -f "$OUTPUT" ]; then
      echo "File $OUTPUT exists, skipping..."
      return
    fi

    echo "Processing source file: $BASENAME"

    if [ ! -f "$CHANGE_RASTER" ]; then
        echo "Warning: No matching NKG2016LU raster for $BASENAME, skipping."
        return
    fi

    gdal_calc \
      -A "$VRT" \
      -B "$CHANGE_RASTER" \
      --outfile="$OUTPUT" \
      --calc="A + ((B * $YEARS) / 1000.0)" \
      --type=Float32 \
      --NoDataValue=-9999 \
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
export CHANGE_FOLDER OUTPUT_FOLDER CALENDAR_YEAR YEARS

# Run all VRTs in parallel
find "$BASE_DEM_FOLDER" -name "*.vrt" | xargs -n 1 -P "$PARALLEL_JOBS" bash -c 'process_pair "$0"'

echo "All source files processed."
