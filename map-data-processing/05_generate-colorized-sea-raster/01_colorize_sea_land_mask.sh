#!/bin/bash

# Exit if any command fails
set -euo pipefail

# Apply color table to sea/land masks
# Sea -> blue, Land -> transparent

INPUT_FOLDER="../04_sea-level-mask-calculation/sea_land_masks"
OUTPUT_FOLDER="./sea_land_colored"
PARALLEL_JOBS=8

mkdir -p "$OUTPUT_FOLDER"

# Create color table
COLOR_TABLE=$(mktemp sea_land_color.txt)

# Mask file format: <geotif mask value> <r,g,b> <transparency: 0 transparent, 255 opaque>
# Mask value 0 (Land): no color and fully transparent
# Mask value 1 (Sea): blue color and fully opaque
cat > "$COLOR_TABLE" << EOF
0 0 0 0 0
1 0 0 255 255
EOF

# Function to colorize a single mask
colorize_mask() {
    local INPUT_FILE="$1"
    local YEAR_FOLDER="$2"
    local YEAR=$(basename "$YEAR_FOLDER")
    local OUTPUT_BASENAME=$(basename "${INPUT_FILE%_mask.tif}")

    local YEAR_OUTPUT_FOLDER="$OUTPUT_FOLDER/$YEAR"
    mkdir -p "$YEAR_OUTPUT_FOLDER"

    local OUTPUT_FILE="$YEAR_OUTPUT_FOLDER/${OUTPUT_BASENAME}.tif"

    if [ -f "$OUTPUT_FILE" ]; then
      echo "File $OUTPUT_FILE exists, skipping..."
      return
    fi

    echo "Colorizing mask: $INPUT_FILE"

    gdaldem color-relief "$INPUT_FILE" "$COLOR_TABLE" "$OUTPUT_FILE" \
        -alpha \
        -co COMPRESS=DEFLATE \
        -co PREDICTOR=2 \
        -co ZLEVEL=9 \
        -co TILED=YES \
        -co BLOCKXSIZE=256 \
        -co BLOCKYSIZE=256 \
        -co BIGTIFF=YES
}

export -f colorize_mask
export OUTPUT_FOLDER COLOR_TABLE

# Process all mask files
echo "Searching for sea/land mask folders in $INPUT_FOLDER..."

find "$INPUT_FOLDER" -mindepth 1 -maxdepth 1 -type d | while read YEAR_FOLDER; do
    find "$YEAR_FOLDER" -name "*.tif" | \
        xargs -I{} -P "$PARALLEL_JOBS" bash -c 'colorize_mask "$1" "$2"' _ "{}" "$YEAR_FOLDER"
done

# Clean up
rm -f "$COLOR_TABLE"

echo "Colorization complete."
