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

RESULTS_DIR="./results/${SOURCE_VERSION}"
OUTPUT_FILE="${RESULTS_DIR}/combined_deltas_pivot.csv"

# Check results directory
if [[ ! -d "$RESULTS_DIR" ]]; then
  echo "ERROR: Results directory not found: $RESULTS_DIR"
  exit 1
fi

# Gather all unique years
YEARS=$(jq -r '.data[].year' "$RESULTS_DIR"/*.json | sort -n | uniq)

# Build CSV header
HEADER="name,x,y"
for Y in $YEARS; do
  HEADER+=",$Y"
done
echo "$HEADER" > "$OUTPUT_FILE"

# Process each result JSON file
for FILE in "$RESULTS_DIR"/*.json; do
  NAME=$(jq -r '.name' "$FILE")
  X=$(jq -r '.x' "$FILE")
  Y_COORD=$(jq -r '.y' "$FILE")

  ROW="\"$NAME\",$X,$Y_COORD"

  for YEAR in $YEARS; do
    DELTA=$(jq -r --argjson year "$YEAR" '.data[] | select(.year == $year) | .delta' "$FILE" 2>/dev/null || echo "")
    [[ -z "$DELTA" || "$DELTA" == "null" ]] && DELTA=""
    ROW+=",$DELTA"
  done

  echo "$ROW" >> "$OUTPUT_FILE"
done

echo "CSV written to: $OUTPUT_FILE"
