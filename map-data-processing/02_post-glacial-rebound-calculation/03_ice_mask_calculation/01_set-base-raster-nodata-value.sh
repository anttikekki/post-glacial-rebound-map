#!/bin/bash

set -euo pipefail

# CONFIGURATION 
INPUT_RASTER="../01_download-GLARE-model-data/Base-raster-tm35fin.tif"
VRT_WITH_NODATA="./Base-raster-band2-nodata-tm35fin.vrt"
NODATA_VALUE=99999

if [ -f "$VRT_WITH_NODATA" ]; then
  echo "Output file $VRT_WITH_NODATA exists, skipping..."
  exit 0
fi

# Create VRT and inject NoDataValue for Band 2 using sed 
echo "Creating VRT with NoDataValue=$NODATA_VALUE for Band 2..."

# Generate base VRT
gdal_translate -of VRT "$INPUT_RASTER" "$VRT_WITH_NODATA"

# Inject NoDataValue into Band 2 using sed
TMPFILE=$(mktemp)
awk -v nodata="$NODATA_VALUE" '
  BEGIN { inserted=0 }
  /<VRTRasterBand[^>]*band="2"/ {
    print; getline;
    if ($0 !~ /<NoDataValue>/) {
      print "    <NoDataValue>" nodata "</NoDataValue>";
      inserted=1;
    }
  }
  { print }
  END {
    if (!inserted) {
      print "Warning: No VRTRasterBand band=\"2\" found or NoDataValue already present."
    }
  }
' "$VRT_WITH_NODATA" > "$TMPFILE" && mv "$TMPFILE" "$VRT_WITH_NODATA"

echo "NoData value set to $NODATA_VALUE"
