#!/bin/bash

set -euo pipefail

# Requirements
command -v jq >/dev/null || { echo "This script requires jq but it's not installed."; exit 1; }

# Configuration
SEA_LEVEL_RASTER="../02_post-glacial-rebound-calculation/01_download-GLARE-model-data/sea-level-baltic.tif"
BASE_DEM_FOLDER="./cropped-elevation_model"
ALIGNED_BASE_FOLDER="./cropped_gdal_raster"
CSV_OUTPUT_FOLDER="./calculation_results/csv"

YEAR_START=-10000
YEAR_END=2000
YEAR_INTERVAL=250
PARALLEL_JOBS=8

mkdir -p "$CSV_OUTPUT_FOLDER"

# Original untouched GLARE formula
ORIGINAL_FORMULA='"User_DTM@1" - ((2 / 3.14159 * ("Base Raster@1" * 0.075) * (ATAN("Base Raster@2" / (5 * ("Base Raster@1" * 0.075) + 500)) - ATAN(("Base Raster@2" -1950 + [yearCE]) / (5 * ("Base Raster@1" * 0.075) + 500)))) + ((("Base Raster@3" * 0.072) * ((2020 - [yearCE]) / 100)) - (0.5 * (-0.014 * (("Base Raster@3" * 0.072) * ((2020 - [yearCE]) / 100) ^ 2))))) - [sea-level ref]'

export SEA_LEVEL_RASTER BASE_DEM_FOLDER ALIGNED_BASE_FOLDER CSV_OUTPUT_FOLDER ORIGINAL_FORMULA YEAR_START YEAR_END YEAR_INTERVAL

process_city() {
    DEM_PATH="$1"
    CITY=$(basename "$DEM_PATH" .tif)
    BASE_RASTER="${ALIGNED_BASE_FOLDER}/${CITY}.tif"
    CSV_OUT="${CSV_OUTPUT_FOLDER}/${CITY}.csv"

     echo "Starting: $CITY"

    if [[ ! -f "$BASE_RASTER" ]]; then
        echo "Missing base raster for $CITY"
        return 1
    fi

    # Write CSV header
    echo "year,land_level,melt_bp" > "$CSV_OUT"

    # Glacier melting year (BP)
    MELT_BP=$(gdallocationinfo -valonly -b 2 "$BASE_RASTER" 0 0) 

    # Prepare static part of expression (leave SEA_LEVEL to be replaced inside loop)
    CALC_EXPR="${ORIGINAL_FORMULA//\[yearCE\]/YEAR}"
    CALC_EXPR="${CALC_EXPR//\"User_DTM@1\"/A}"
    CALC_EXPR="${CALC_EXPR//\"Base Raster@1\"/B}"
    CALC_EXPR="${CALC_EXPR//\"Base Raster@2\"/C}" # Glacier melting year (BP)
    CALC_EXPR="${CALC_EXPR//\"Base Raster@3\"/D}" # NKG2016LU postglacial land uplift model
    CALC_EXPR="${CALC_EXPR//ATAN/atan}"
    CALC_EXPR="${CALC_EXPR//^/**}"

    # Year loop
    for YEAR in $(seq $YEAR_START $YEAR_INTERVAL $YEAR_END); do
        THIS_EXPR="${CALC_EXPR//YEAR/$YEAR}"
        SEA_LEVEL=$(gdallocationinfo -valonly -geoloc "$SEA_LEVEL_RASTER" "$YEAR" 0)
        THIS_EXPR="${THIS_EXPR//\[sea-level ref\]/$SEA_LEVEL}"

        TMP_OUT="$(mktemp /tmp/tmp_glare_XXXXXX).tif"

        gdal_calc \
            -A "$DEM_PATH" \
            -B "$BASE_RASTER" --B_band=1 \
            -C "$BASE_RASTER" --C_band=2 \
            -D "$BASE_RASTER" --D_band=3 \
            --calc="$THIS_EXPR" \
            --outfile="$TMP_OUT" \
            --type=Float32 \
            --NoDataValue=-9999 \
            --quiet

        LAND_LEVEL=$(gdallocationinfo -valonly "$TMP_OUT" 0 0)
        echo "$YEAR,$LAND_LEVEL,$MELT_BP" >> "$CSV_OUT"
        rm "$TMP_OUT"
    done

    echo "Finished: $CITY (CSV: $CSV_OUT)"
}

export -f process_city

# Run in parallel using 8 processes
find "$BASE_DEM_FOLDER" -name "*.tif" | xargs -n 1 -P "$PARALLEL_JOBS" -I {} bash -c 'process_city "$@"' _ {}

echo "All cities processed."
