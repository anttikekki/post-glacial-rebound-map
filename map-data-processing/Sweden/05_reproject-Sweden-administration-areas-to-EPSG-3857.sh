#!/bin/bash

SOURCE="ne_50m_admin_0_countries/sweden.shp"
TARGET="ne_50m_admin_0_countries/sweden_EPSG_3857.shp"

# Check if source file exists
if [ ! -f "$SOURCE" ]; then
  echo "Error: Source file '$SOURCE' does not exist."
  exit 1
fi

# Check if target file already exists
if [ -f "$TARGET" ]; then
  echo "Target file '$TARGET' already exists. Skipping reprojection."
  exit 0
fi

# Run ogr2ogr reprojection
echo "Reprojecting '$SOURCE' to '$TARGET' (EPSG:3857)..."
ogr2ogr -f "ESRI Shapefile" "$TARGET" "$SOURCE" -t_srs EPSG:3857

# Check if ogr2ogr succeeded
if [ $? -eq 0 ]; then
  echo "Reprojection completed successfully."
else
  echo "Error: ogr2ogr failed."
  exit 2
fi
