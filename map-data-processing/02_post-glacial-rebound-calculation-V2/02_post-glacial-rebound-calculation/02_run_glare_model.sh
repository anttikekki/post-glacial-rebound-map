#!/bin/bash

# Exit if any command fails
set -euo pipefail

# ====== CONFIGURABLE INPUTS ======

INPUT_RASTER="GEBCO_2024_GLARE.tif"            # Digital Terrain Model (DTM)
BASE_RASTER="Base_Raster.tif"                  # Raster with uplift parameters (3 bands)
SEALEVEL_RASTER="Sea_Level.tif"                # Sea-level raster
YEAR_IN_CE=-10739                              # Target simulation year (e.g. -4000 for 4000 BCE)
DEM_REFERENCE_YEAR=2023                        # Year when elevation values of INPUT_RASTER are valid
PIXEL_SIZE=10000                               # Optional: set if using resampling
CRS="EPSG:4326"                                # Coordinate Reference System

# ====== OUTPUT FILENAMES ======

CONST_YEAR="const_year.tif"
CONST_SEALEVEL="const_sealevel.tif"
OUTPUT="glare_output.tif"

# ====== STEP 1: Create constant raster for year value ======

gdal_calc.py \
  -A "$INPUT_RASTER" \
  --outfile="$CONST_YEAR" \
  --calc="$YEAR_IN_CE" \
  --type=Float32 \
  --extent=intersect \
  --co="COMPRESS=LZW"

# ====== STEP 2: Extract sea-level value from raster ======

SEA_LEVEL=$(gdallocationinfo -valonly -geoloc "$SEALEVEL_RASTER" "$YEAR_IN_CE" 0)

# Create constant raster using sea level
gdal_calc.py \
  -A "$INPUT_RASTER" \
  --outfile="$CONST_SEALEVEL" \
  --calc="$SEA_LEVEL" \
  --type=Float32 \
  --extent=intersect \
  --co="COMPRESS=LZW"

# ====== STEP 3: Final calculation using full GLARE formula ======

gdal_calc.py \
  -A "$INPUT_RASTER" \                 # A: User DTM — the base terrain model to adjust
  -B "$BASE_RASTER" --B_band=1 \       # B: Base Raster Band 1 — maximum ice thickness (h)
  -C "$BASE_RASTER" --C_band=2 \       # C: Base Raster Band 2 — ice retreat year (r)
  -D "$CONST_YEAR" \                   # D: Constant raster of selected simulation year (y)
  -E "$CONST_SEALEVEL" \               # E: Constant raster of sea level for that year
  -F "$BASE_RASTER" --F_band=3 \       # F: Base Raster Band 3 — current uplift rate (v)
  --outfile="$OUTPUT" \
  --type=Float32 \
  --calc='A - (
    (2 / 3.14159 * (B * 0.077) * (
      atan(C / (5 * (B * 0.077) + 590)) -
      atan((C -1950 + D) / (5 * (B * 0.077) + 590))
    )) +
    (((F * 0.075) * (('"$DEM_REFERENCE_YEAR"' - D) / 100)) -
    (0.5 * (-0.011 * ((F * 0.075) * (('"$DEM_REFERENCE_YEAR"' - D) / 100) ** 2))))
  ) - E' \
  --co="COMPRESS=LZW"


echo "GLARE output generated: $OUTPUT"
