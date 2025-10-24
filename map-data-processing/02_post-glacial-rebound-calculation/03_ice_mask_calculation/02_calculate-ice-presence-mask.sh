#!/bin/bash

set -euo pipefail

# CONFIGURATION
VRT_WITH_NODATA="./Base-raster-band2-nodata-tm35fin.vrt"
YEAR_LIST_JSON="../../../common/iceMapLayerYears.json"
OUTPUT_FOLDER="./ice_presence_masks"
PARALLEL_JOBS=8

mkdir -p "$OUTPUT_FOLDER"

process_year() {
    local CALENDAR_YEAR="$1"
    local BP_YEAR=$((1950 - (CALENDAR_YEAR)))
    local OUTPUT_FILE="$OUTPUT_FOLDER/${CALENDAR_YEAR}.tif"

    if [ -f "$OUTPUT_FILE" ]; then
        echo "Output for year $CALENDAR_YEAR exists, skipping."
        return
    fi
    if [ ! -f "$VRT_WITH_NODATA" ]; then
        echo "Input file $VRT_WITH_NODATA not found, aborting."
        exit 1
    fi

    echo "Processing year $CALENDAR_YEAR (BP = $BP_YEAR)..."
    # Input data in band 2: BP (Before present) year when there was glacial before melting.
    # Output data in band 1:
    #  0 = no ice
    #  1 = ice
    #  255 = NoData
    gdal_calc \
      -A "$VRT_WITH_NODATA" --A_band=2 \
      --calc="A <= $BP_YEAR" \
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

    echo "Done: $OUTPUT_FILE"
}

export -f process_year
export VRT_WITH_NODATA OUTPUT_FOLDER OUTPUT_NODATA

# Extract years and run in parallel 
jq '.[]' "$YEAR_LIST_JSON" | \
  xargs -n 1 -P "$PARALLEL_JOBS" -I{} bash -c 'process_year "$@"' _ {}

echo "All ice presence masks generated."
