#!/bin/bash

# Exit if any command fails
set -euo pipefail

# Generate binary sea/land masks from uplifted DEMs
# Land (height > 0) -> 0
# Sea (height <= 0) -> 1

INPUT_FOLDER="../03_post-glacial-rebound-calculation/uplifted_DEMs"
OUTPUT_FOLDER="./sea_land_masks"
PARALLEL_JOBS=8

mkdir -p "$OUTPUT_FOLDER"

# Function to process a single DEM file
process_mask() {
    local INPUT_FILE="$1"
    local YEAR_FOLDER="$2"
    local YEAR=$(basename "$YEAR_FOLDER")
    local BASENAME=$(basename "${INPUT_FILE%.*}")

    local YEAR_OUTPUT_FOLDER="$OUTPUT_FOLDER/$YEAR"
    mkdir -p "$YEAR_OUTPUT_FOLDER"

    local OUTPUT_FILE="$YEAR_OUTPUT_FOLDER/${BASENAME}_mask.tif"

    echo "Generating mask for: $INPUT_FILE"

    gdal_calc \
      -A "$INPUT_FILE" \
      --outfile="$OUTPUT_FILE" \
      --calc="(A <= 0) * 1 + (A > 0) * 0" \
      --type=Byte \
      --NoDataValue=255 \
      --overwrite \
      --co COMPRESS=DEFLATE \
      --co PREDICTOR=2 \
      --co ZLEVEL=9 \
      --co TILED=YES \
      --co BLOCKXSIZE=256 \
      --co BLOCKYSIZE=256 \
      --co BIGTIFF=YES
}

export -f process_mask
export OUTPUT_FOLDER

# Process all files
echo "Searching for uplifted DEM folders in $INPUT_FOLDER..."

find "$INPUT_FOLDER" -mindepth 1 -maxdepth 1 -type d | while read YEAR_FOLDER; do
    find "$YEAR_FOLDER" -name "*.tif" | \
        xargs -I{} -P "$PARALLEL_JOBS" bash -c 'process_mask "$1" "$2"' _ "{}" "$YEAR_FOLDER"
done

echo "Mask generation complete."
