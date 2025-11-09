#!/bin/bash
# Script: clip_strandforskjutningsmodell.sh
# Description: Clips predefined layers from a GeoPackage to a Sweden shapefile.
# Usage: ./clip_strandforskjutningsmodell.sh

INPUT="strandforskjutningsmodell/strandforskjutningsmodell_EPSG_3857.gpkg"
OUTPUT="strandforskjutningsmodell/strandforskjutningsmodell_EPSG_3857_sweden.gpkg"
CLIP="ne_50m_admin_0_countries/sweden_EPSG_3857.shp"

# --- 1. Check if output already exists ---
if [ -f "$OUTPUT" ]; then
  echo "Target file '$OUTPUT' already exists. Skipping execution."
  exit 0
fi

# --- 2. Check if input file exists ---
if [ ! -f "$INPUT" ]; then
  echo "Error: Source file '$INPUT' does not exist."
  exit 1
fi

# --- 3. Check if clip file exists ---
if [ ! -f "$CLIP" ]; then
  echo "Error: Clip file '$CLIP' does not exist."
  exit 1
fi

# --- 4. Hard-coded layer list ---
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

FIRST_LAYER=true

# --- 5. Loop through layers and clip each one. Fix TopologyException error on the fly. ---
for LAYER in "${LAYER_LIST[@]}"; do
  echo "Clipping layer: $LAYER ..."

  if $FIRST_LAYER; then
    ogr2ogr -f GPKG "$OUTPUT" "$INPUT" \
      -nln "$LAYER" \
      -clipsrc "$CLIP" \
      -dialect SQLite \
      -sql "SELECT MakeValid(geom) AS geom, * FROM $LAYER" \
      -nlt MULTIPOLYGON
    FIRST_LAYER=false
  else
    ogr2ogr -f GPKG "$OUTPUT" "$INPUT" \
      -nln "$LAYER" \
      -clipsrc "$CLIP" \
      -dialect SQLite \
      -sql "SELECT MakeValid(geom) AS geom, * FROM $LAYER" \
      -nlt MULTIPOLYGON \
      -update
  fi

  if [ $? -ne 0 ]; then
    echo "Error: Clipping failed for layer '$LAYER'."
    exit 3
  fi
done

echo "Clipping completed successfully. Output: $OUTPUT"
