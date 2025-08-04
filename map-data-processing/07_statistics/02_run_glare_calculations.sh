#!/bin/bash

set -euo pipefail

# Requirements
command -v jq >/dev/null || { echo "This script requires jq but it's not installed."; exit 1; }

# Configuration
SEA_LEVEL_RASTER="../02_post-glacial-rebound-calculation-V2/01_download-GLARE-model-data/sea-level-baltic.tif"
BASE_DEM_FOLDER="./cropped-elevation_model"
ALIGNED_BASE_FOLDER="./cropped_gdal_raster"
OUTPUT_ROOT_FOLDER="./calculation_results/csv"
JSON_OUTPUT_FOLDER="./calculation_results/json"
COORDINATES_JSON="./coordinates.json"

YEAR_START=-10000
YEAR_END=2000
YEAR_INTERVAL=250
PARALLEL_JOBS=8

mkdir -p "$OUTPUT_ROOT_FOLDER"
mkdir -p "$JSON_OUTPUT_FOLDER"

# Original untouched GLARE formula
ORIGINAL_FORMULA='"User_DTM@1" - ((2 / 3.14159 * ("Base Raster@1" * 0.075) * (ATAN("Base Raster@2" / (5 * ("Base Raster@1" * 0.075) + 500)) - ATAN(("Base Raster@2" -1950 + [yearCE]) / (5 * ("Base Raster@1" * 0.075) + 500)))) + ((("Base Raster@3" * 0.072) * ((2020 - [yearCE]) / 100)) - (0.5 * (-0.014 * (("Base Raster@3" * 0.072) * ((2020 - [yearCE]) / 100) ^ 2))))) - [sea-level ref]'

export SEA_LEVEL_RASTER BASE_DEM_FOLDER ALIGNED_BASE_FOLDER OUTPUT_ROOT_FOLDER JSON_OUTPUT_FOLDER ORIGINAL_FORMULA YEAR_START YEAR_END YEAR_INTERVAL COORDINATES_JSON

process_city() {
    DEM_PATH="$1"
    CITY=$(basename "$DEM_PATH" .tif)
    BASE_RASTER="${ALIGNED_BASE_FOLDER}/${CITY}.tif"
    CSV_OUT="${OUTPUT_ROOT_FOLDER}/${CITY}.csv"
    JSON_OUT="${JSON_OUTPUT_FOLDER}/${CITY}.json"

    # Look up city metadata from coordinates.json
    META=$(jq -r --arg city "$CITY" '.[] | select(.name == $city)' "$COORDINATES_JSON")
    if [[ -z "$META" ]]; then
        echo "No metadata found in coordinates.json for $CITY"
        return 1
    fi
    NAME=$(echo "$META" | jq -r '.name')
    X=$(echo "$META" | jq -r '.x')
    Y=$(echo "$META" | jq -r '.y')
    MAPSHEET=$(echo "$META" | jq -r '.mapSheet')

    if [[ ! -f "$BASE_RASTER" ]]; then
        echo "Missing base raster for $CITY"
        return 1
    fi

    # Write CSV header
    echo "year,sea_level,base_band1,base_band2,base_band3,land_level" > "$CSV_OUT"

    # Fetch B, C, D values only once (single-pixel rasters)
    VAL_B=$(gdallocationinfo -valonly -b 1 "$BASE_RASTER" 0 0)
    VAL_C=$(gdallocationinfo -valonly -b 2 "$BASE_RASTER" 0 0)
    VAL_D=$(gdallocationinfo -valonly -b 3 "$BASE_RASTER" 0 0)

    # Prepare static part of expression (leave SEA_LEVEL to be replaced inside loop)
    CALC_EXPR="${ORIGINAL_FORMULA//\[yearCE\]/YEAR}"
    CALC_EXPR="${CALC_EXPR//\"User_DTM@1\"/A}"
    CALC_EXPR="${CALC_EXPR//\"Base Raster@1\"/B}"
    CALC_EXPR="${CALC_EXPR//\"Base Raster@2\"/C}"
    CALC_EXPR="${CALC_EXPR//\"Base Raster@3\"/D}"
    CALC_EXPR="${CALC_EXPR//ATAN/atan}"
    CALC_EXPR="${CALC_EXPR//^/**}"

    # Yearly loop
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

        VAL=$(gdallocationinfo -valonly "$TMP_OUT" 0 0)
        echo "$YEAR,$SEA_LEVEL,$VAL_B,$VAL_C,$VAL_D,$VAL" >> "$CSV_OUT"
        rm "$TMP_OUT"
    done

    # Build JSON from the CSV we just created (use land_level column and compute delta)
    years=()
    levels=()
    
    while IFS=',' read year sea base1 base2 base3 land_level; do
        if [[ "$year" == "year" ]]; then continue; fi
        years+=("$year")
        levels+=("$land_level")
    done < "$CSV_OUT"

    data_entries=()
    for i in "${!years[@]}"; do
        year_i=${years[$i]}
        level_i=${levels[$i]}
        if [[ $i -eq 0 ]]; then
            delta="null"
        else
            prev=${levels[$((i-1))]}
            # Use awk for floating arithmetic reliably across environments
            delta=$(awk -v a="$level_i" -v b="$prev" 'BEGIN{printf("%.10f", a-b)}')
        fi
        data_entries+=("{\"year\": $year_i, \"elevation\": $level_i, \"delta\": $delta}")
    done
    data_json=$(IFS=, ; echo "${data_entries[*]}")

    jq -n \
      --arg name "$NAME" \
      --argjson x "$X" \
      --argjson y "$Y" \
      --arg mapSheet "$MAPSHEET" \
      --argjson data "[$data_json]" \
      '{
        name: $name,
        x: $x,
        y: $y,
        mapSheet: $mapSheet,
        data: $data
      }' > "$JSON_OUT"

    echo "Finished: $CITY (CSV: $CSV_OUT, JSON: $JSON_OUT)"
}

export -f process_city

# Run in parallel using 8 processes
find "$BASE_DEM_FOLDER" -name "*.tif" | xargs -n 1 -P "$PARALLEL_JOBS" -I {} bash -c 'process_city "$@"' _ {}

echo "All cities processed."
