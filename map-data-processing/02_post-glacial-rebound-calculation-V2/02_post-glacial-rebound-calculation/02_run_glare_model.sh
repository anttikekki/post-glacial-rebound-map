#!/bin/bash

# Exit on errors, unset vars, or failed pipes
set -euo pipefail

# Configurations
BASE_DEM_FOLDER="../../01_download-nls-elevation-model-2m/vrt"
ALIGNED_BASE_FOLDER="./aligned_GLARE_base_rasters"
SEA_LEVEL_RASTER="../01_download-GLARE-model-data/sea-level-baltic.tif"
OUTPUT_ROOT_FOLDER="./calculation_results"
PARALLEL_JOBS=8

# NLS elevation model reference year (used in the slow uplift formula)
DEM_REFERENCE_YEAR=2023

# Check for required positional argument: CALENDAR_YEAR
if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <CALENDAR_YEAR>"
    echo "Example: $0 -4000"
    exit 1
fi

CALENDAR_YEAR="$1"

# Define output folder for year
OUTPUT_FOLDER="$OUTPUT_ROOT_FOLDER/$CALENDAR_YEAR"

# Create output folder if needed
mkdir -p "$OUTPUT_FOLDER"

# Function to process a single VRT and matching base raster
process_vrt() {
    local VRT="$1"
    local BASENAME=$(basename "$VRT" .vrt)
    local BASE_ALIGNED="${ALIGNED_BASE_FOLDER}/${BASENAME}_GLARE_base_raster_aligned.tif"
    local OUTPUT="${OUTPUT_FOLDER}/${BASENAME}.tif"

    if [ -f "$OUTPUT" ]; then
        echo "Output exists for $BASENAME, skipping."
        return
    fi

    if [ ! -f "$BASE_ALIGNED" ]; then
        echo "Missing aligned base raster for $BASENAME: $BASE_ALIGNED"
        return 1
    fi

    echo "Processing: $BASENAME"

    # Query sea level
    SEA_LEVEL=$(gdallocationinfo -valonly -geoloc "$SEA_LEVEL_RASTER" "$CALENDAR_YEAR" 0)
    echo "Sea level for $CALENDAR_YEAR = $SEA_LEVEL"

    gdal_calc \
      -A "$VRT" \
      -B "$BASE_ALIGNED" --B_band=1 \
      -C "$BASE_ALIGNED" --C_band=2 \
      -F "$BASE_ALIGNED" --F_band=3 \
      --outfile="$OUTPUT" \
      --calc="A - (
        (2 / 3.14159 * (B * 0.077) * (
          atan(C / (5 * (B * 0.077) + 590)) -
          atan((C -1950 + $CALENDAR_YEAR) / (5 * (B * 0.077) + 590))
        )) +
        ((F * 0.075) * (($DEM_REFERENCE_YEAR - $CALENDAR_YEAR) / 100)) -
        (0.5 * (-0.011 * ((F * 0.075) * (($DEM_REFERENCE_YEAR - $CALENDAR_YEAR) / 100) ** 2)))
      ) - $SEA_LEVEL" \
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

export -f process_vrt
export ALIGNED_BASE_FOLDER SEA_LEVEL_RASTER OUTPUT_FOLDER CALENDAR_YEAR DEM_REFERENCE_YEAR

# Run all VRTs in parallel
find "$BASE_DEM_FOLDER" -name "*.vrt" | xargs -n 1 -P "$PARALLEL_JOBS" bash -c 'process_vrt "$0"'

echo "All DEMs processed with CALENDAR_YEAR = $CALENDAR_YEAR."
