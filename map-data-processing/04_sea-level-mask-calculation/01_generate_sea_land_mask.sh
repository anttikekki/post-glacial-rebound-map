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
  V1)
    INPUT_FOLDER="../02_post-glacial-rebound-calculation-V1/02_post-glacial-rebound-calculation/calculation_results"
    ;;
  V2)
    INPUT_FOLDER="../02_post-glacial-rebound-calculation-V2/02_post-glacial-rebound-calculation/calculation_results"
    ;;
  *)
    echo "Invalid VERSION: $SOURCE_VERSION"
    echo "Valid options: V1, V2"
    exit 1
    ;;
esac


OUTPUT_FOLDER="./sea_land_masks/${SOURCE_VERSION}"
PARALLEL_JOBS=8

mkdir -p "$OUTPUT_FOLDER"

# Function to process a single DEM file
process_mask() {
    local INPUT_FILE="$1"
    local YEAR_FOLDER="$2"
    local YEAR=$(basename "$YEAR_FOLDER")
    local OUTPUT_BASENAME=$(basename "${INPUT_FILE%.*}")

    local YEAR_OUTPUT_FOLDER="$OUTPUT_FOLDER/$YEAR"
    mkdir -p "$YEAR_OUTPUT_FOLDER"

    local OUTPUT_FILE="$YEAR_OUTPUT_FOLDER/${OUTPUT_BASENAME}_mask.tif"

    if [ -f "$OUTPUT_FILE" ]; then
      echo "Output file $OUTPUT_FILE exists, skipping..."
      return
    fi

    echo "Generating mask for year $YEAR $INPUT_FILE"

    # Generate binary sea/land masks from uplifted DEMs
    # Land (height > 0) -> 0
    # Sea (height <= 0) -> 1
    gdal_calc \
      -A "$INPUT_FILE" \
      --outfile="$OUTPUT_FILE" \
      --calc="(A <= 0) * 1 + (A > 0) * 0" \
      --type=Byte \
      --NoDataValue=255 \
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

find "$INPUT_FOLDER" -mindepth 1 -maxdepth 1 -type d | while read -r YEAR_FOLDER; do
    find "$YEAR_FOLDER" -name "*.tif" | \
        xargs -I{} -P "$PARALLEL_JOBS" bash -c 'process_mask "$0" "$1"' {} "$YEAR_FOLDER"
done

echo "Mask generation complete."
