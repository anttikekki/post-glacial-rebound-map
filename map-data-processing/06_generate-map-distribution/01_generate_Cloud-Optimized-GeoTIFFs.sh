#!/bin/bash

# Exit if any command fails
set -euo pipefail

# --- Parse input arguments ---
if [ $# -ne 2 ]; then
    echo "Usage: $0 SOURCE SOURCE_VERSION"
    echo "SOURCE must be one of: MASK, COLORIZED"
    echo "SOURCE_VERSION must be one of: V1, V2"
    exit 1
fi

SOURCE="$1"
SOURCE_VERSION="$2"
PARALLEL_JOBS=8

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

case "$SOURCE" in
  MASK)
    INPUT_BASE="../04_sea-level-mask-calculation/sea_land_masks/${SOURCE_VERSION}"
    ;;
  COLORIZED)
    INPUT_BASE="../05_generate-colorized-sea-raster/sea_land_colored/${SOURCE_VERSION}"
    ;;
  *)
    echo "Invalid SOURCE: $SOURCE"
    echo "Valid options: MASK, COLORIZED"
    exit 1
    ;;
esac

OUTPUT_FOLDER="./result_cog/${SOURCE_VERSION}"
VRT_FOLDER="./source_vrt/${SOURCE_VERSION}"

mkdir -p "$OUTPUT_FOLDER" "$VRT_FOLDER"

# Function to process a single year folder
process_year_folder() {
    local YEAR_FOLDER="$1"
    local YEAR
    YEAR=$(basename "$YEAR_FOLDER")

    local VRT_FILE="$VRT_FOLDER/${YEAR}.vrt"
    local OUTPUT_COG="$OUTPUT_FOLDER/${YEAR}.tif"

    if [ -f "$VRT_FILE" ] && [ -f "$OUTPUT_COG" ]; then
        echo "Files exist for $YEAR, skipping..."
        return
    fi

    local TIF_LIST
    TIF_LIST=$(find "$YEAR_FOLDER" -type f -name "*.tif")
    if [ -z "$TIF_LIST" ]; then
        echo "No .tif files found in $YEAR_FOLDER, skipping..."
        return
    fi

    echo "Building VRT for $YEAR..."
    gdalbuildvrt "$VRT_FILE" $TIF_LIST

    echo "Translating to COG for $YEAR..."
    gdal_translate "$VRT_FILE" "$OUTPUT_COG" \
        -of COG \
        -co COMPRESS=DEFLATE \
        -co LEVEL=9 \
        -co PREDICTOR=2 \
        -co BLOCKSIZE=512

    echo "Done: $YEAR"
}

export -f process_year_folder
export VRT_FOLDER OUTPUT_FOLDER

# Run in parallel
find "$INPUT_BASE" -mindepth 1 -maxdepth 1 -type d | \
  xargs -I{} -P "$PARALLEL_JOBS" bash -c 'process_year_folder "$@"' _ {}

echo "All COGs generated successfully in $OUTPUT_FOLDER!"
