#!/bin/bash

# Exit if any command fails
set -euo pipefail

if [ $# -lt 2 ]; then
    echo "Usage: $0 SOURCE SOURCE_VERSION [YEAR1 YEAR2 ...]"
    echo "SOURCE must be one of: MASK, COLORIZED"
    echo "Calculation source data SOURCE_VERSION must be one of: V1, V2"
    echo "Optional YEAR values can be provided to process specific years."
    exit 1
fi

SOURCE="$1"
SOURCE_VERSION="$2"
shift  # Remove SOURCE from the list of positional arguments
shift  # Remove SOURCE_VERSION from the list of positional arguments

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
    INPUT_FOLDER="../04_sea-level-mask-calculation/sea_land_masks/${SOURCE_VERSION}"
    ;;
  COLORIZED)
    INPUT_FOLDER="../05_generate-colorized-sea-raster/sea_land_colored/${SOURCE_VERSION}"
    ;;
  *)
    echo "Invalid SOURCE: $SOURCE"
    echo "Valid options: MASK, COLORIZED"
    exit 1
    ;;
esac

if [ "$#" -ge 1 ]; then
    echo "Processing specific years: $*"
    YEAR_FOLDERS=()
    for y in "$@"; do
        YEAR_FOLDERS+=("$INPUT_FOLDER/$y")
    done
else
    YEAR_FOLDERS=($(find "$INPUT_FOLDER" -mindepth 1 -maxdepth 1 -type d))
    echo "Processing all years in $INPUT_FOLDER"
fi

# Output folders
OUTPUT_FOLDER="./result_cog/${SOURCE_VERSION}"
VRT_FOLDER="./source_vrt/${SOURCE_VERSION}"

mkdir -p "$OUTPUT_FOLDER"
mkdir -p "$VRT_FOLDER"

for YEAR_FOLDER in "${YEAR_FOLDERS[@]}"; do
    if [ ! -d "$YEAR_FOLDER" ]; then
      echo "$YEAR_FOLDER not found, aborting..."
      exit 1;
    fi

    YEAR=$(basename "$YEAR_FOLDER")
    echo "Processing year: $YEAR"

    VRT_FILE="$VRT_FOLDER/${YEAR}.vrt"
    OUTPUT_COG="$OUTPUT_FOLDER/${YEAR}.tif"

    if [ -f "$OUTPUT_COG" ]; then
      echo "Output file $OUTPUT_COG exists, skipping..."
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
    # Large blocksize decreases initial Image File Directory (IFD) download size in UI.
    # 512: IFD download ~3200 kb
    # 1024: IFD download ~900 kb
    # 2048: IFD download ~450 kb
    # PREDICTOR=YES is same as PREDICTOR=2
    gdal_translate \
      "$VRT_FILE" "$OUTPUT_COG" \
      -of COG \
      -co COMPRESS=DEFLATE \
      -co LEVEL=9 \
      -co PREDICTOR=YES \
      -co BLOCKSIZE=1024 \
      -co NUM_THREADS=ALL_CPUS

done

echo "All COGs generated successfully in $OUTPUT_FOLDER"
