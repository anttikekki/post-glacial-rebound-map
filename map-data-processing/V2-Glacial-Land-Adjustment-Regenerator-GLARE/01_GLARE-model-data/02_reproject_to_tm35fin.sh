#!/bin/bash

# Exit if any command fail
set -euo pipefail

# ============================================================
# REPROJECT GLARE Base Raster to ETRS89 / TM35FIN (EPSG:3067)
# ============================================================

# === CONFIGURATION ===
INPUT_TIF="Base_Raster.tif"                 # Source raster
REPROJECTED_TIF="Base-raster-tm35fin.tif"   # Output reprojected raster
SRC_CRS="EPSG:4326"                    # Source WGS 84 CRS (lat/lon degrees)
TARGET_CRS="EPSG:3067"                 # Target CRS (Finland meters)

# === RUN GDALWARP ===
gdalwarp -overwrite \
  -s_srs $SRC_CRS \
  -t_srs $TARGET_CRS \
  -r near \
  -of GTiff \
  "$INPUT_TIF" "$REPROJECTED_TIF"

echo "Raster reprojected to $TARGET_CRS: $REPROJECTED_TIF"
