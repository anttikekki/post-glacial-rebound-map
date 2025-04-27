#!/bin/bash

# Exit if any command fail
set -euo pipefail

# ===================================================
# PROCESS points.csv → Raster (GeoTIFF)
# ===================================================

# === CONFIGURATION ===
INPUT_CSV="NKG2016LU_lev.csv"         # Input CSV file
VRT_FILE="NKG2016LU_lev.vrt"           # VRT file to describe CSV format
OUTPUT_TIF="NKG2016LU_lev.tif"         # Output raster
CRS="EPSG:4326"                 # Source CRS (WGS84 / lat-lon)
TXE_MIN=0.0                     # West longitude (degrees)
TXE_MAX=50.0                    # East longitude (degrees)
TYE_MIN=49.0                    # South latitude (degrees)
TYE_MAX=75.0                    # North latitude (degrees)
OUTSIZE_X=301                   # Number of columns
OUTSIZE_Y=313                   # Number of rows

# === CREATE VRT FILE ===
cat <<EOF > "$VRT_FILE"
<OGRVRTDataSource>
  <OGRVRTLayer name="NKG2016LU_lev">
    <SrcDataSource>$INPUT_CSV</SrcDataSource>
    <GeometryType>wkbPoint</GeometryType>
    <GeometryField encoding="PointFromColumns" x="Longitude" y="Latitude"/>
    <LayerSRS>$CRS</LayerSRS>
    <Field name="Value" type="Real" src="Value"/>
  </OGRVRTLayer>
</OGRVRTDataSource>
EOF

echo "VRT file created: $VRT_FILE"

# === RUN GDAL_GRID TO CREATE RASTER ===
gdal_grid \
  -zfield Value \
  -a nearest:radius1=0.0:radius2=0.0:angle=0.0 \
  -txe $TXE_MIN $TXE_MAX \
  -tye $TYE_MIN $TYE_MAX \
  -outsize $OUTSIZE_X $OUTSIZE_Y \
  -of GTiff \
  "$VRT_FILE" "$OUTPUT_TIF"

echo "Raster generated: $OUTPUT_TIF"
