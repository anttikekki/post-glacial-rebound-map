#!/bin/bash

INPUT_DIR="07_rasters"
OUTPUT_DIR="08_raster_cogs"

if [ ! -d "$INPUT_DIR" ]; then
  echo "Error: Source directory '$INPUT_DIR' does not exist!"
  exit 1
fi

mkdir -p "$OUTPUT_DIR"

FILES=$(find "$INPUT_DIR" -type f -name "*.tif")

if [ -z "$FILES" ]; then
  echo "Error: No .tif files found in '$INPUT_DIR'."
  exit 1
fi

for FILE_WITH_PATH in $FILES; do
  FILE=$(basename "$FILE_WITH_PATH")
  OUT_TIF="$OUTPUT_DIR/${FILE}"

  if [ -f "$OUT_TIF" ]; then
    echo "Skipping '$FILE_WITH_PATH' (COG already exists: $OUT_TIF)"
    continue
  fi

  echo "Converting to COG: $FILE_WITH_PATH ..."

  gdal_translate "$FILE_WITH_PATH" "$OUT_TIF" \
    -of COG \
    -co COMPRESS=DEFLATE \
    -co LEVEL=9 \
    -co PREDICTOR=YES \
    -co BLOCKSIZE=1024 \
    -co NUM_THREADS=ALL_CPUS

  if [ $? -ne 0 ]; then
    echo "Warning: Conversion failed for '$FILE_WITH_PATH'. Skipping."
    rm -f "$OUT_TIF"
    continue
  fi

  echo "Created COG: $OUT_TIF"
done

echo "COG generation complete. Files stored in '$OUTPUT_DIR/'"
