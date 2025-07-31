#!/bin/bash

set -euo pipefail

# Configuration
SEA_LEVEL_RASTER="../02_post-glacial-rebound-calculation-V2/01_download-GLARE-model-data/sea-level-baltic.tif"
BASE_DEM_FOLDER="./cropped-elevation_model"
ALIGNED_BASE_FOLDER="./cropped_gdal_raster"
OUTPUT_ROOT_FOLDER="./calculation_results"
YEAR_START=-8000
YEAR_END=-5000
YEAR_INTERVAL=10
PARALLEL_JOBS=8

mkdir -p "$OUTPUT_ROOT_FOLDER"

# Original untouched GLARE formula
ORIGINAL_FORMULA='"User_DTM@1" - ((2 / 3.14159 * ("Base Raster@1" * 0.075) * (ATAN("Base Raster@2" / (5 * ("Base Raster@1" * 0.075) + 500)) - ATAN(("Base Raster@2" -1950 + [yearCE]) / (5 * ("Base Raster@1" * 0.075) + 500)))) + ((("Base Raster@3" * 0.072) * ((2020 - [yearCE]) / 100)) - (0.5 * (-0.014 * (("Base Raster@3" * 0.072) * ((2020 - [yearCE]) / 100) ^ 2))))) - [sea-level ref]'

export SEA_LEVEL_RASTER BASE_DEM_FOLDER ALIGNED_BASE_FOLDER OUTPUT_ROOT_FOLDER ORIGINAL_FORMULA YEAR_START YEAR_END YEAR_INTERVAL

process_city() {
    DEM_PATH="$1"
    CITY=$(basename "$DEM_PATH" .tif)
    BASE_RASTER="${ALIGNED_BASE_FOLDER}/${CITY}.tif"
    CSV_OUT="${OUTPUT_ROOT_FOLDER}/${CITY}.csv"

    if [[ ! -f "$BASE_RASTER" ]]; then
        echo "Missing base raster for $CITY"
        return 1
    fi

    echo "year,sea_level,base_band1,base_band2,base_band3,value" > "$CSV_OUT"

    # Fetch B, C, D values only once
    VAL_B=$(gdallocationinfo -valonly -b 1 "$BASE_RASTER" 0 0)
    VAL_C=$(gdallocationinfo -valonly -b 2 "$BASE_RASTER" 0 0)
    VAL_D=$(gdallocationinfo -valonly -b 3 "$BASE_RASTER" 0 0)

    # Prepare static part of expression (just leave SEA_LEVEL to be replaced in loop)
    CALC_EXPR="${ORIGINAL_FORMULA//\[yearCE\]/YEAR}"
    CALC_EXPR="${CALC_EXPR//\"User_DTM@1\"/A}"
    CALC_EXPR="${CALC_EXPR//\"Base Raster@1\"/B}"
    CALC_EXPR="${CALC_EXPR//\"Base Raster@2\"/C}"
    CALC_EXPR="${CALC_EXPR//\"Base Raster@3\"/D}"
    CALC_EXPR="${CALC_EXPR//ATAN/atan}"
    CALC_EXPR="${CALC_EXPR//^/**}"

    for YEAR in $(seq $YEAR_START $YEAR_INTERVAL $YEAR_END); do
        # Replace YEAR placeholder
        THIS_EXPR="${CALC_EXPR//YEAR/$YEAR}"

        # Get sea level for year
        SEA_LEVEL=$(gdallocationinfo -valonly -geoloc "$SEA_LEVEL_RASTER" "$YEAR" 0)
        THIS_EXPR="${THIS_EXPR//\[sea-level ref\]/$SEA_LEVEL}"

        # Temporary file
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

        VAL=$(gdallocationinfo -valonly "$TMP_OUT" 0 0)
        echo "$YEAR,$SEA_LEVEL,$VAL_B,$VAL_C,$VAL_D,$VAL" >> "$CSV_OUT"
        rm "$TMP_OUT"
    done

    echo "Finished: $CITY"
}

export -f process_city

# Run in parallel using 8 processes
find "$BASE_DEM_FOLDER" -name "*.tif" | xargs -n 1 -P "$PARALLEL_JOBS" -I {} bash -c 'process_city "$@"' _ {}

echo "All cities processed."
