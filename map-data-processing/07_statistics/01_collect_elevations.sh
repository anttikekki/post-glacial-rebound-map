#!/bin/bash

set -euo pipefail

if [ $# -lt 1 ]; then
    echo "Usage: $0 SOURCE_VERSION"
    echo "Calculation source data SOURCE_VERSION must be one of: V1, V2"
    exit 1
fi

SOURCE_VERSION="$1"

case "$SOURCE_VERSION" in
  V1|V2)
    # Valid values, continue
    ;;
  *)
    echo "Error: Invalid SOURCE_VERSION value: '$SOURCE_VERSION'" >&2
    echo "Valid options are: V1 or V2" >&2
    exit 1
    ;;
esac

mkdir -p ./results/$SOURCE_VERSION

COORDS_FILE="coordinates.json"
YEARS_FILE="../../common/mapLayerYearsModelV2.json"
REBOUND_BASE_DIR="../02_post-glacial-rebound-calculation-${SOURCE_VERSION}/02_post-glacial-rebound-calculation/calculation_results"

if [[ ! -f "$COORDS_FILE" ]]; then
  echo "ERROR: Coordinates file not found: $COORDS_FILE"
  exit 1
fi

if [[ ! -f "$YEARS_FILE" ]]; then
  echo "ERROR: Years file not found: $YEARS_FILE"
  exit 1
fi

YEARS=()
while read -r year; do
  YEARS+=("$year")
done < <(jq -r '.[]' "$YEARS_FILE")

IFS=$'\n' YEARS_SORTED=($(sort -n <<<"${YEARS[*]}"))
unset IFS

jq -c '.[]' "$COORDS_FILE" | while read -r location; do
  NAME=$(echo "$location" | jq -r '.name')
  X=$(echo "$location" | jq -r '.x')
  Y=$(echo "$location" | jq -r '.y')
  MAP_SHEET=$(echo "$location" | jq -r '.mapSheet')
  OUTPUT_FILE="./results/${SOURCE_VERSION}/${NAME}.json"

  echo "Processing location: $NAME"

  if [[ -f "$OUTPUT_FILE" ]]; then
    RESULT=$(cat "$OUTPUT_FILE")
  else
    RESULT=$(echo "$location" | jq '{name: .name, x: .x, y: .y, mapSheet: .mapSheet, data: []}')
  fi

  for YEAR in "${YEARS_SORTED[@]}"; do
    EXISTS=$(echo "$RESULT" | jq --arg year "$YEAR" '.data[] | select(.year == ($year | tonumber))' | wc -l)
    if [[ "$EXISTS" -gt 0 ]]; then
      echo "  Skipping year $YEAR — already present."
      continue
    fi

    TIF_FILE="${REBOUND_BASE_DIR}/${YEAR}/${MAP_SHEET}.tif"
    echo "  Checking year $YEAR..."

    if [[ -f "$TIF_FILE" ]]; then
      ELEVATION=$(gdallocationinfo -valonly -geoloc "$TIF_FILE" "$X" "$Y")

      if [[ -n "$ELEVATION" ]]; then
        echo "    Elevation at $X,$Y is $ELEVATION"
        RESULT=$(jq --arg year "$YEAR" --arg elev "$ELEVATION" \
          '.data += [{ year: ($year | tonumber), elevation: ($elev | tonumber) }]' <<< "$RESULT")
      else
        echo "    WARNING: No elevation found at $X,$Y"
      fi
    else
      echo "    WARNING: File not found: $TIF_FILE"
    fi
  done

  echo "$RESULT" > "$OUTPUT_FILE"
  echo "  Updated: $OUTPUT_FILE"
done

echo "Done collecting elevations."
