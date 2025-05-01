#!/bin/bash

# Exit if any command fails
set -euo pipefail

# Configurations
SOURCE_FOLDER="../02_nls-elevation-model-2m/vrt"
RESULT_FOLDER="./calculation_results"
PARALLEL_JOBS=8

echo "Comparing DEM statistics (fast method) between source and uplifted results..."
printf "%-50s %-15s %-15s %-15s\n" "Filename" "MinChange" "MaxChange" "MeanChange"
echo "----------------------------------------------------------------------------------------------------------"

# Function to process one result file and its matching source
process_pair() {
    local RESULT_FILE="$1"
    local YEAR_FOLDER="$2"

    local BASENAME=$(basename "$RESULT_FILE")
    local BASENAME_NOEXT="${BASENAME%.*}"

    local YEAR=$(basename "$YEAR_FOLDER")
    
    # Strip "_uplifted_*" from result file name to find source VRT
    local SOURCE_BASE=${BASENAME_NOEXT%_uplifted_*}
    local SOURCE_FILE="$SOURCE_FOLDER/${SOURCE_BASE}.vrt"

    if [ ! -f "$SOURCE_FILE" ]; then
        echo "Warning: Source file not found for $BASENAME"
        return
    fi

    # Safe stats extraction for source
    SRC_STATS=$(gdalinfo -stats "$SOURCE_FILE" | awk '
        /STATISTICS_MINIMUM=/ {split($0,a,"="); min=a[2]}
        /STATISTICS_MAXIMUM=/ {split($0,a,"="); max=a[2]}
        /STATISTICS_MEAN=/ {split($0,a,"="); mean=a[2]}
        END {print min, max, mean}'
    )

    if [ -z "$SRC_STATS" ]; then
        echo "Warning: No statistics for $SOURCE_FILE"
        return
    fi

    read MIN_SRC MAX_SRC MEAN_SRC <<< "$SRC_STATS"

    # Safe stats extraction for result
    RES_STATS=$(gdalinfo -stats "$RESULT_FILE" | awk '
        /STATISTICS_MINIMUM=/ {split($0,a,"="); min=a[2]}
        /STATISTICS_MAXIMUM=/ {split($0,a,"="); max=a[2]}
        /STATISTICS_MEAN=/ {split($0,a,"="); mean=a[2]}
        END {print min, max, mean}'
    )

    if [ -z "$RES_STATS" ]; then
        echo "Warning: No statistics for $RESULT_FILE"
        return
    fi

    read MIN_RES MAX_RES MEAN_RES <<< "$RES_STATS"

    # Calculate changes
    MIN_CHANGE=$(echo "$MIN_RES - $MIN_SRC" | bc -l)
    MAX_CHANGE=$(echo "$MAX_RES - $MAX_SRC" | bc -l)
    MEAN_CHANGE=$(echo "$MEAN_RES - $MEAN_SRC" | bc -l)

    printf "%-50s %-15.2f %-15.2f %-15.2f\n" "${YEAR}/${BASENAME}" $MIN_CHANGE $MAX_CHANGE $MEAN_CHANGE
}

# Export function and variables for xargs
export -f process_pair
export SOURCE_FOLDER

# Process all uplifted DEM result files
find "$RESULT_FOLDER" -mindepth 1 -maxdepth 1 -type d | while read YEAR_FOLDER; do
    find "$YEAR_FOLDER" -name "*.tif" | \
    xargs -I{} -P "$PARALLEL_JOBS" bash -c 'process_pair "$1" "$2"' _ "{}" "$YEAR_FOLDER"
done

echo "Summary of changes complete."
