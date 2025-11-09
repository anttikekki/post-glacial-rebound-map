#!/bin/bash

SOURCE="strandforskjutningsmodell/strandforskjutningsmodell.gpkg"
TARGET="strandforskjutningsmodell/strandforskjutningsmodell_EPSG_3857.gpkg"

# Check if source file exists
if [ ! -f "$SOURCE" ]; then
  echo "Error: Source file '$SOURCE' does not exist."
  exit 1
fi

# Check if target file already exists
if [ -f "$TARGET" ]; then
  echo "Target file '$TARGET' already exists. Skipping transformation."
  exit 0
fi

# Run ogr2ogr transformation
echo "Reprojecting '$SOURCE' to '$TARGET' (EPSG:3857)..."
ogr2ogr -f GPKG "$TARGET" "$SOURCE" -t_srs EPSG:3857

# Check if ogr2ogr succeeded by chdecking it's return status code
if [ $? -eq 0 ]; then
  echo "Transformation completed successfully."
else
  echo "Error: ogr2ogr failed."
  exit 1
fi
