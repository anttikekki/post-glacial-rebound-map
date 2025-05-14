#!/bin/bash

set -euo pipefail

# === CONFIGURATION ===
INPUT_CSV="NKG2016LU_lev.csv"
VRT_FILE="NKG2016LU_lev.vrt"
OUTPUT_TIF="NKG2016LU_lev.tif"
CRS="EPSG:4326"
METADATA_FILE="grid_metadata.txt"

# === LOAD METADATA ===
source "$METADATA_FILE"

echo "Loaded metadata:"
echo "Longitude: $TXE_MIN to $TXE_MAX ($OUTSIZE_X columns)"
echo "Latitude:  $TYE_MIN to $TYE_MAX ($OUTSIZE_Y rows)"

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
  -txe "$TXE_MIN" "$TXE_MAX" \
  -tye "$TYE_MIN" "$TYE_MAX" \
  -outsize "$OUTSIZE_X" "$OUTSIZE_Y" \
  -of GTiff \
  "$VRT_FILE" "$OUTPUT_TIF"

echo "Raster generated successfully: $OUTPUT_TIF"
