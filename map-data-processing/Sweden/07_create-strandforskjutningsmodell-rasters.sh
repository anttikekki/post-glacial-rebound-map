#!/bin/bash

INPUT_GPKG="strandforskjutningsmodell/strandforskjutningsmodell_EPSG_3857_sweden.gpkg"
OUTPUT_DIR="07_rasters"
# SGU documentation: "In Swedish land areas, an elevation model with a resolution of 50 m is used"
PIXEL_SIZE=50
LAND_DATABAND_VALUE=0
# Polygons are sea, set value to 1
SEA_DATABAND_VALUE=1

if [ ! -f "$INPUT_GPKG" ]; then
  echo "Error: Input file '$INPUT_GPKG' not found!"
  exit 1
fi

mkdir -p "$OUTPUT_DIR"

LAYER_LIST=(
  "bp1000_1900"
  "bp2000_2900"
  "bp1_900"
  "bp10000_10900"
  "bp4000_4900"
  "bp9000_9900"
  "bp5000_5900"
  "bp7000_7900"
  "bp11000_11900"
  "bp13000_13500"
  "bp12000_12900"
  "bp8000_8900"
  "bp3000_3900"
  "bp6000_6900"
)

for LAYER in "${LAYER_LIST[@]}"; do
  OUT_TIF="$OUTPUT_DIR/${LAYER}.tif"

  if [ -f "$OUT_TIF" ]; then
    echo "Skipping '$LAYER' (already exists: $OUT_TIF)"
    continue
  fi

  echo "Rasterizing layer: $LAYER ..."

  gdal_rasterize \
    -a_nodata $LAND_DATABAND_VALUE \
    -burn $SEA_DATABAND_VALUE \
    -tr $PIXEL_SIZE $PIXEL_SIZE \
    -of GTiff "$INPUT_GPKG" "$OUT_TIF" \
    -l "$LAYER" \
    -co COMPRESS=DEFLATE \
    -co PREDICTOR=2

  if [ $? -ne 0 ]; then
    echo "Warning: Rasterization failed for layer '$LAYER'. Skipping."
    rm -f "$OUT_TIF"
    continue
  fi

  echo "Created raster: $OUT_TIF"
done

echo "Rasterization complete."
