#!/bin/bash

# Exit if any command fails
set -euo pipefail

INPUT_FOLDER="./ice_presence_masks"
OUTPUT_FOLDER="./result_cog"

mkdir -p "$OUTPUT_FOLDER"

# Loop through year subfolders
find "$INPUT_FOLDER" -type f -name "*.tif" | while read INPUT_FILE; do
    YEAR=$(basename "$INPUT_FILE")
    echo "Processing year: $YEAR from $INPUT_FILE"

    OUTPUT_FILE="$OUTPUT_FOLDER/${YEAR}"

    if [ -f "$OUTPUT_FILE" ]; then
      echo "Output file $OUTPUT_FILE exists, skipping..."
      continue
    fi

    echo "Creating compressed COG $OUTPUT_FILE"
    # COG driver docs: https://gdal.org/en/stable/drivers/raster/cog.html
    gdal_translate \
      "$INPUT_FILE" "$OUTPUT_FILE" \
      -of COG \
      -co COMPRESS=DEFLATE \
      -co LEVEL=9 \
      -co PREDICTOR=2 \
      -co BLOCKSIZE=512 \
      -co NUM_THREADS=ALL_CPUS

done

echo "All COGs generated successfully in $OUTPUT_FOLDER!"
