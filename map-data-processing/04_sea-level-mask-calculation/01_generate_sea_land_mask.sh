#!/bin/bash

# Exit if any command fails
set -euo pipefail

if [ "$#" -lt 1 ]; then
    echo "Usage: $0 SOURCE_VERSION [YEAR1 YEAR2 ...]"
    echo "SOURCE_VERSION must be one of: V1, V2"
    echo "Optional YEAR values can be provided to process specific years."
    exit 1
fi

SOURCE_VERSION="$1"
shift  # Remove SOURCE_VERSION from the list of positional arguments

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

OUTPUT_FOLDER="./sea_land_masks/${SOURCE_VERSION}"
PARALLEL_JOBS=8

mkdir -p "$OUTPUT_FOLDER"

process_mask() {
    local INPUT_FILE="$1"
    local YEAR_FOLDER="$2"
    local YEAR=$(basename "$YEAR_FOLDER")
    local MAP_SHEET=$(basename "${INPUT_FILE%.*}")
    local YEAR_OUTPUT_FOLDER="$OUTPUT_FOLDER/$YEAR"
    local OUTPUT_FILE="$YEAR_OUTPUT_FOLDER/${MAP_SHEET}_mask.tif"
    local BP_YEAR=$((1950 - (YEAR)))

    mkdir -p "$YEAR_OUTPUT_FOLDER"

    if [ -f "$OUTPUT_FILE" ]; then
      echo "Output file $OUTPUT_FILE exists, skipping..."
      return
    fi

    if [ "$SOURCE_VERSION" = "V2" ]; then
        # Determine input GLARE_BASE_RASTER_FOLDER based on year.
        if [ "$YEAR" -lt -5500 ]; then
            local GLARE_BASE_RASTER_FOLDER="../02_post-glacial-rebound-calculation-V2/02_post-glacial-rebound-calculation/aligned_GLARE_base_rasters/whole-Finland"
        else
            local GLARE_BASE_RASTER_FOLDER="../02_post-glacial-rebound-calculation-V2/02_post-glacial-rebound-calculation/aligned_GLARE_base_rasters/coast-only"
        fi

        local GLARE_BASE_RASTER_FILE="$GLARE_BASE_RASTER_FOLDER/${MAP_SHEET}_GLARE_base_raster_aligned.tif"
        if [ ! -f "$GLARE_BASE_RASTER_FILE" ]; then
          echo "File $GLARE_BASE_RASTER_FILE not found, aborting..."
          exit 1
        fi

        echo "Generating combined land/sea/ice mask for year $YEAR $INPUT_FILE"
        # Input:
        #  INPUT_FILE = NLS elevation model for selected year. 
        #    Data band 1 (Float32): land height in meters
        #  GLARE_BASE_RASTER_FILE = Glare base raster aligned to selected year INPUT_FILE extent.
        #    Data band 2: BP (Before present) year when there was glacial before melting.
        # Output:
        #  Land = 0
        #  Sea = 1
        #  Ice = 2
        #  NoData = 255
        gdal_calc \
          -A "$INPUT_FILE" \
          -B "$GLARE_BASE_RASTER_FILE" --B_band=2 \
          --calc="(B <= $BP_YEAR)*2 + (B > $BP_YEAR)*((A <= 0)*1 + (A > 0)*0)" \
          --outfile="$OUTPUT_FILE" \
          --type=Byte \
          --NoDataValue=255 \
          --co COMPRESS=DEFLATE \
          --co PREDICTOR=2 \
          --co ZLEVEL=9 \
          --co TILED=YES \
          --co BLOCKXSIZE=256 \
          --co BLOCKYSIZE=256 \
          --co BIGTIFF=YES
    else
        echo "Generating land/sea mask for year $YEAR $INPUT_FILE"
        # Land = 0
        # Sea = 1
        gdal_calc.py \
          -A "$INPUT_FILE" \
          --calc="(A <= 0)*1 + (A > 0)*0" \
          --outfile="$OUTPUT_FILE" \
          --type=Byte \
          --NoDataValue=255 \
          --co COMPRESS=DEFLATE \
          --co PREDICTOR=2 \
          --co ZLEVEL=9 \
          --co TILED=YES \
          --co BLOCKXSIZE=256 \
          --co BLOCKYSIZE=256 \
          --co BIGTIFF=YES
    fi
}

export -f process_mask
export OUTPUT_FOLDER SOURCE_VERSION

# Process files
for YEAR_FOLDER in "${YEAR_FOLDERS[@]}"; do
    if [ ! -d "$YEAR_FOLDER" ]; then
      echo "$YEAR_FOLDER not found, aborting..."
      exit 1;
    fi

    find "$YEAR_FOLDER" -name "*.tif" | \
        xargs -I{} -P "$PARALLEL_JOBS" bash -c 'process_mask "$1" "$2"' _ {} "$YEAR_FOLDER"
done

echo "Mask generation complete."
