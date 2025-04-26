#!/bin/bash

# Exit if any command in a pipeline fails
set -euo pipefail

# ===================================================
# REPROJECT DEM Raster to ETRS89 / TM35FIN (EPSG:3067)
# ===================================================

# === CONFIGURATION ===
INPUT_TIF="NKG2016LU_lev.tif"                # Your source raster
REPROJECTED_TIF="NKG2016LU_lev_tm35fin.tif"   # Output reprojected raster
SRC_CRS="EPSG:4326"                    # Source CRS (lat/lon degrees)
TARGET_CRS="EPSG:3067"                 # Target CRS (Finland meters)

# === RUN GDALWARP ===
gdalwarp \
  -s_srs $SRC_CRS \
  -t_srs $TARGET_CRS \
  -r near \
  -of GTiff \
  "$INPUT_TIF" "$REPROJECTED_TIF"

echo "✅ Raster reprojected to $TARGET_CRS: $REPROJECTED_TIF"
