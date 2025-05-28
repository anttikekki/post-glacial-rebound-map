#!/bin/bash

set -euo pipefail

BASE_INPUT_FOLDER="./mml/korkeusmalli/hila_2m/etrs-tm35fin-n2000"
OUTPUT_FOLDER_WHOLE="./vrt/whole-Finland"
OUTPUT_FOLDER_COAST="./vrt/coast-only"
COAST_LIST_FILE="map-sheets-to-download-coast-only.txt"

mkdir -p "$OUTPUT_FOLDER_WHOLE"
mkdir -p "$OUTPUT_FOLDER_COAST"

if [ ! -d "$BASE_INPUT_FOLDER" ]; then
    echo "Input folder does not exist: $BASE_INPUT_FOLDER"
    exit 1
fi

# Read coast-only folder names into array, skipping comments
MAP_SHEETS=()
if [ -f "$COAST_LIST_FILE" ]; then
    while IFS= read -r line; do
        [[ "$line" == \#* || -z "$line" ]] && continue
        MAP_SHEETS+=("$line")
    done < "$COAST_LIST_FILE"
else
    echo "Map sheet list file not found: $COAST_LIST_FILE"
    exit 1
fi

process_folder() {
    local SUBFOLDER="$1"
    local OUTPUT_BASE="$2"

    local SUBFOLDER_NAME
    SUBFOLDER_NAME=$(basename "$SUBFOLDER")
    local VRT_OUTPUT="$OUTPUT_BASE/${SUBFOLDER_NAME}.vrt"

    if [ -f "$VRT_OUTPUT" ]; then
        echo "File $VRT_OUTPUT exists, skipping..."
        return
    fi

    echo "Building VRT for subfolder: $SUBFOLDER_NAME → $OUTPUT_BASE"

    TIFF_FILES=$(find "$SUBFOLDER" -type f \( -iname "*.tif" -o -iname "*.tiff" \))

    if [ -z "$TIFF_FILES" ]; then
        echo "No TIFF files found in $SUBFOLDER, skipping..."
        return
    fi

    gdalbuildvrt \
        -vrtnodata -9999 \
        -srcnodata -9999 \
        "$VRT_OUTPUT" $TIFF_FILES

    if [ -f "$VRT_OUTPUT" ]; then
        echo "Patching VRT paths and setting relativeToVRT=\"1\": $VRT_OUTPUT"
        sed -i.bak 's|>./mml/|>../mml/|g' "$VRT_OUTPUT"
        sed -i.bak 's|relativeToVRT="0"|relativeToVRT="1"|g' "$VRT_OUTPUT"
        rm -f "${VRT_OUTPUT}.bak"
    fi

    echo "VRT created and patched: $VRT_OUTPUT"
}

echo "Processing all map sheets for whole Finland VRTs..."

for SUBFOLDER in "$BASE_INPUT_FOLDER"/*/; do
    [ -d "$SUBFOLDER" ] || continue
    process_folder "$SUBFOLDER" "$OUTPUT_FOLDER_WHOLE"
done

echo "Processing Finland coast only map sheets..."

for SUBFOLDER in "$BASE_INPUT_FOLDER"/*/; do
    [ -d "$SUBFOLDER" ] || continue
    SUBFOLDER_NAME=$(basename "$SUBFOLDER")

    for MAP_SHEET in "${MAP_SHEETS[@]}"; do
        if [[ "$SUBFOLDER_NAME" == "$MAP_SHEET" ]]; then
            process_folder "$SUBFOLDER" "$OUTPUT_FOLDER_COAST"
            break
        fi
    done
done

echo "VRT creation complete."
