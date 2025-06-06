#!/bin/bash

set -euo pipefail

mkdir -p ./results

COORDS_FILE="coordinates.json"
YEARS_FILE="../../common/mapLayerYearsModelV2.json"
REBOUND_BASE_DIR="../02_post-glacial-rebound-calculation-V2/02_post-glacial-rebound-calculation/calculation_results"

# Check input files
if [[ ! -f "$COORDS_FILE" ]]; then
  echo "ERROR: Coordinates file not found: $COORDS_FILE"
  exit 1
fi

if [[ ! -f "$YEARS_FILE" ]]; then
  echo "ERROR: Years file not found: $YEARS_FILE"
  exit 1
fi

echo "Starting processing..."

# Load years into array
YEARS=()
while read -r year; do
  YEARS+=("$year")
done < <(jq -r '.[]' "$YEARS_FILE")

# Sort years numerically
IFS=$'\n' YEARS_SORTED=($(sort -n <<<"${YEARS[*]}"))
unset IFS

# Process each coordinate
jq -c '.[]' "$COORDS_FILE" | while read -r location; do
  NAME=$(echo "$location" | jq -r '.name')
  X=$(echo "$location" | jq -r '.x')
  Y=$(echo "$location" | jq -r '.y')
  MAP_SHEET=$(echo "$location" | jq -r '.mapSheet')
  OUTPUT_FILE="./results/${NAME}.json"

  echo "Processing location: $NAME (Map sheet: $MAP_SHEET, X: $X, Y: $Y)"

  # Load existing result if present
  if [[ -f "$OUTPUT_FILE" ]]; then
    RESULT=$(cat "$OUTPUT_FILE")
  else
    RESULT=$(echo "$location" | jq '{name: .name, x: .x, y: .y, mapSheet: .mapSheet, data: []}')
  fi

  PREV_ELEV=""
  PREV_YEAR=""

  for YEAR in "${YEARS_SORTED[@]}"; do
    # Skip if year already exists in data
    EXISTS=$(echo "$RESULT" | jq --arg year "$YEAR" '.data[] | select(.year == ($year | tonumber))' | wc -l)
    if [[ "$EXISTS" -gt 0 ]]; then
      echo "  Skipping year $YEAR — already present."
      # Also update prev_elev and prev_year so deltas remain consistent
      E=$(echo "$RESULT" | jq --arg year "$YEAR" '.data[] | select(.year == ($year | tonumber)) | .elevation')
      if [[ -n "$E" ]]; then
        PREV_ELEV="$E"
        PREV_YEAR="$YEAR"
      fi
      continue
    fi

    TIF_FILE="${REBOUND_BASE_DIR}/${YEAR}/${MAP_SHEET}.tif"
    echo "  Checking year $YEAR..."

    if [[ -f "$TIF_FILE" ]]; then
      ELEVATION=$(gdallocationinfo -valonly -geoloc "$TIF_FILE" "$X" "$Y")

      if [[ -n "$ELEVATION" ]]; then
        echo "    Elevation at $X,$Y is $ELEVATION"
        # Calculate delta if previous elevation exists.
        # Bash does not support floating point numbers so we need to do calculations in awk
        if [[ -n "$PREV_ELEV" ]]; then
          DELTA=$(awk -v curr="$ELEVATION" -v prev="$PREV_ELEV" 'BEGIN { printf "%.4f", curr - prev }')
        else
          DELTA="null"
        fi

        # Update result
        RESULT=$(jq --arg year "$YEAR" --arg elev "$ELEVATION" \
          '.data += [{
            year: ($year | tonumber),
            elevation: ($elev | tonumber),
            delta: '"$DELTA"'
          }]' <<< "$RESULT")

        PREV_ELEV="$ELEVATION"
        PREV_YEAR="$YEAR"
      else
        echo "    WARNING: No elevation value returned for $X,$Y in $TIF_FILE"
      fi
    else
      echo "    WARNING: File not found: $TIF_FILE"
    fi
  done

  echo "$RESULT" > "$OUTPUT_FILE"
  echo "  Updated: $OUTPUT_FILE"
done

echo "Done. Incremental results with elevation deltas saved to ./results/"
