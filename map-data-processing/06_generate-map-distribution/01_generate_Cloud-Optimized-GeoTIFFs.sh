#!/bin/bash

# Exit if any command fails
set -euo pipefail

# --- Parse input argument ---
if [ $# -ne 1 ]; then
    echo "Usage: $0 SOURCE"
    echo "SOURCE must be one of: MASK, COLORIZED"
    exit 1
fi

SOURCE="$1"

case "$SOURCE" in
  MASK)
    INPUT_BASE="../04_sea-level-mask-calculation/sea_land_masks"
    ;;
  COLORIZED)
    INPUT_BASE="../05_generate-colorized-sea-raster/sea_land_colored"
    ;;
  *)
    echo "Invalid SOURCE: $SOURCE"
    echo "Valid options: MASK, COLORIZED"
    exit 1
    ;;
esac

# Output folders
OUTPUT_FOLDER="./result_cog"
VRT_FOLDER="./source_vrt"

mkdir -p "$OUTPUT_FOLDER"
mkdir -p "$VRT_FOLDER"

# Loop through year subfolders
find "$INPUT_BASE" -mindepth 1 -maxdepth 1 -type d | while read YEAR_FOLDER; do
    YEAR=$(basename "$YEAR_FOLDER")
    echo "Processing year: $YEAR"

    VRT_FILE="$VRT_FOLDER/${YEAR}.vrt"
    OUTPUT_COG="$OUTPUT_FOLDER/${YEAR}_cog.tif"

    if [ -f "$VRT_FILE" ] && [ -f "$OUTPUT_COG" ]; then
      echo "Files for year $YEAR exists, skipping..."
      continue
    fi

    # Find all TIFs inside the year folder
    TIF_LIST=$(find "$YEAR_FOLDER" -type f -name "*.tif")

    if [ -z "$TIF_LIST" ]; then
        echo "No .tif files found in $YEAR_FOLDER, skipping..."
        continue
    fi

    echo "Building VRT mosaic for year $YEAR..."
    gdalbuildvrt "$VRT_FILE" $TIF_LIST

    echo "Translating VRT to compressed COG for year $YEAR..."
    # COG driver docs: https://gdal.org/en/stable/drivers/raster/cog.html
    gdal_translate \
      "$VRT_FILE" "$OUTPUT_COG" \
      -of COG \
      -co COMPRESS=DEFLATE \
      -co LEVEL=9 \
      -co PREDICTOR=2 \
      -co BLOCKSIZE=512 \
      -co NUM_THREADS=ALL_CPUS

done

echo "All COGs generated successfully in $OUTPUT_FOLDER!"
