#!/bin/bash

# Exit on errors, unset vars, or failed pipes
set -euo pipefail

# Configurations
BASE_DEM_FOLDER="../../01_download-nls-elevation-model-2m/vrt"
ALIGNED_BASE_FOLDER="./aligned_GLARE_base_rasters"
SEA_LEVEL_RASTER="../01_download-GLARE-model-data/sea-level-baltic.tif"
OUTPUT_ROOT_FOLDER="./calculation_results"
PARALLEL_JOBS=8

# NLS elevation model reference year (used in the slow uplift formula)
DEM_REFERENCE_YEAR=2023

# Check for required positional argument: CALENDAR_YEAR
if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <CALENDAR_YEAR>"
    echo "Example: $0 -4000"
    exit 1
fi

CALENDAR_YEAR="$1"

# Define output folder for year
OUTPUT_FOLDER="$OUTPUT_ROOT_FOLDER/$CALENDAR_YEAR"

# Create output folder if needed
mkdir -p "$OUTPUT_FOLDER"

# Function to process a single VRT and matching base raster
process_vrt() {
    local VRT="$1"
    local BASENAME=$(basename "$VRT" .vrt)
    local BASE_ALIGNED="${ALIGNED_BASE_FOLDER}/${BASENAME}_GLARE_base_raster_aligned.tif"
    local OUTPUT="${OUTPUT_FOLDER}/${BASENAME}.tif"

    if [ -f "$OUTPUT" ]; then
        echo "Output exists for $BASENAME, skipping."
        return
    fi

    if [ ! -f "$BASE_ALIGNED" ]; then
        echo "Missing aligned base raster for $BASENAME: $BASE_ALIGNED"
        return 1
    fi

    echo "Processing: $BASENAME"

    # Query sea level:
    # "sea-level-baltic.tif" is a lookout table for Baltic sea level for target year. The file resolution is 17500 x 20 pixels. 
    # It stores sea level values in X axis. Coordinate symbols the target year. File X coordinates span from -15000 to 2500. 
    # These are the years that are supported in the Glare model. For example sea level data for year 4000 BC is in coordinate 
    # x = -4000, y = 0. Values in file span from -80.0 to 6.0.
    SEA_LEVEL=$(gdallocationinfo -valonly -geoloc "$SEA_LEVEL_RASTER" "$CALENDAR_YEAR" 0)
    echo "Sea level for $CALENDAR_YEAR = $SEA_LEVEL"

    # Glacial Land Adjustment Regenerator (Glare) by Aki Hakonen.
    # Paper: 
    #   Introducing the Glacial Land Adjustment Regenerator (Glare) for Simulating the Final Pleistocene/Holocene Geographical Change in North Europe
    #   Journal of Archaeological Science, 2024.
    #   https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4992429
    #
    # GLARE materials:
    #  Google Drive: https://drive.google.com/drive/folders/184nPIZuX83gr3Yd6tVBGXCkpUysNY-CO
    #  GitHub repository: https://github.com/Hakonaki/land-uplift-recons
    #
    # The Glare formula (from GitHub repository https://github.com/Hakonaki/land-uplift-recons):
    #
    #  "User_DTM@1" - ((2 / 3.14159 * ("Base Raster@1" * 0.077) * (
    #    ATAN("Base Raster@2" / (5 * ("Base Raster@1" * 0.077) + 590)) - 
    #    ATAN(("Base Raster@2" -1950 + [yearCE]) / (5 * ("Base Raster@1" * 0.077) + 590))
    #  )) + 
    #  ((("Base Raster@3" * 0.075) * ((2020 - [yearCE]) / 100)) - 
    #  (0.5 * (-0.011 * (("Base Raster@3" * 0.075) * ((2020 - [yearCE]) / 100) ^ 2))))) 
    #  - [sea-level ref]
    #
    # Parameters:
    #   `User_DTM@1`: Digital Terrain Models (DTM) that contains elevation model. National land survey of Finland (NLS) elevation model from "../../01_download-nls-elevation-model-2m/vrt"
    #   `Base Raster`: "Base Raster.tiff" with three data bands (@1, @2, @3) from "./aligned_GLARE_base_rasters" per NLS map sheet.
    #   `yearCE`: simulated year from "CALENDAR_YEAR" command line parameter.
    #   `2020`: recerence year of `User_DTM@1`. National land survey of Finland (NLS) elevation model is from 2023.
    #   `sea-level ref`: Baltic sea level at `yearCE` from "../01_download-GLARE-model-data/sea-level-baltic.tif".
    #
    # Parameters to gdal_calc formula:
    #   A: National land survey of Finland (NLS) elevation model
    #   B: Base Raster@1
    #   C: Base Raster@2
    #   F: Base Raster@3
    #   `yearCE`: CALENDAR_YEAR variable command line parameter, injected directly to formula.
    #   `2020`: DEM_REFERENCE_YEAR variable of National land survey of Finland (NLS) elevation model (2023), injected directly to formula.
    #   `sea-level ref`: SEA_LEVEL variable from gdallocationinfo, injected directly to formula.
    gdal_calc \
      -A "$VRT" \
      -B "$BASE_ALIGNED" --B_band=1 \
      -C "$BASE_ALIGNED" --C_band=2 \
      -F "$BASE_ALIGNED" --F_band=3 \
      --outfile="$OUTPUT" \
      --calc="A - (
        (2 / 3.14159 * (B * 0.077) * (
          atan(C / (5 * (B * 0.077) + 590)) -
          atan((C -1950 + $CALENDAR_YEAR) / (5 * (B * 0.077) + 590))
        )) +
        ((F * 0.075) * (($DEM_REFERENCE_YEAR - $CALENDAR_YEAR) / 100)) -
        (0.5 * (-0.011 * ((F * 0.075) * (($DEM_REFERENCE_YEAR - $CALENDAR_YEAR) / 100) ** 2)))
      ) - $SEA_LEVEL" \
      --type=Float32 \
      --NoDataValue=-9999 \
      --co COMPRESS=DEFLATE \
      --co PREDICTOR=2 \
      --co ZLEVEL=9 \
      --co TILED=YES \
      --co BLOCKXSIZE=256 \
      --co BLOCKYSIZE=256 \
      --co BIGTIFF=YES

    echo "Finished: $OUTPUT"
}

export -f process_vrt
export ALIGNED_BASE_FOLDER SEA_LEVEL_RASTER OUTPUT_FOLDER CALENDAR_YEAR DEM_REFERENCE_YEAR

# Run all VRTs in parallel
find "$BASE_DEM_FOLDER" -name "*.vrt" | xargs -n 1 -P "$PARALLEL_JOBS" bash -c 'process_vrt "$0"'

echo "All DEMs processed with CALENDAR_YEAR = $CALENDAR_YEAR."
