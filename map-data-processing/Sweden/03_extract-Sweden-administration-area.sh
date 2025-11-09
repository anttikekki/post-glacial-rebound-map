#!/bin/bash

SOURCE="ne_50m_admin_0_countries/ne_50m_admin_0_countries.shp"
TARGET="ne_50m_admin_0_countries/sweden.shp"

# Check if source file exists
if [ ! -f "$SOURCE" ]; then
  echo "Error: Source file '$SOURCE' does not exist."
  exit 1
fi

# Check if target file already exists
if [ -f "$TARGET" ]; then
  echo "Target file '$TARGET' already exists. Skipping extraction."
  exit 0
fi

# Run ogr2ogr extraction
echo "Extracting Sweden from '$SOURCE' to '$TARGET'..."
ogr2ogr -f "ESRI Shapefile" "$TARGET" "$SOURCE" -where "ADMIN = 'Sweden'"

# Check if ogr2ogr succeeded
if [ $? -eq 0 ]; then
  echo "Extraction completed successfully."
else
  echo "Error: ogr2ogr failed."
  exit 2
fi
