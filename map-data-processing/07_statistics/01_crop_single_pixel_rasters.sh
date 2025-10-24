#!/bin/bash

# Exit on errors, unset vars, or failed pipes
set -euo pipefail

# Requires: jq
command -v jq >/dev/null || { echo "This script requires jq but it's not installed."; exit 1; }

# Create output folders
mkdir -p cropped-elevation_model
mkdir -p cropped_gdal_raster

# Path to JSON data
COORD_FILE="./coordinates.json"

# Iterate through each object in JSON
jq -c '.[]' "$COORD_FILE" | while read -r item; do
  city=$(echo "$item" | jq -r '.name')
  x=$(echo "$item" | jq -r '.x')
  y=$(echo "$item" | jq -r '.y')
  mapSheet=$(echo "$item" | jq -r '.mapSheet')

  vrt_file="../01_download-nls-elevation-model-2m/vrt/whole-Finland/${mapSheet}.vrt"
  glare_file="../02_post-glacial-rebound-calculation/01_download-GLARE-model-data/Base-raster-tm35fin.tif"

  out_vrt="cropped-elevation_model/${city}.tif"
  out_glare="cropped_gdal_raster/${city}.tif"

  # ---- Crop VRT tile if result doesn't exist
  if [[ ! -f "$out_vrt" ]]; then
    if [[ -f "$vrt_file" ]]; then
      gdal_translate -projwin "$x" "$y" "$x" "$y" -projwin_srs EPSG:3067 "$vrt_file" "$out_vrt"
      echo "VRT cropped for $city -> $out_vrt"
    else
      echo "Missing VRT for mapSheet $mapSheet ($vrt_file)"
    fi
  else
    echo "Skipping VRT crop for $city (already exists)"
  fi

  # ---- Crop GLARE raster if result doesn't exist
  if [[ ! -f "$out_glare" ]]; then
    if [[ -f "$glare_file" ]]; then
      gdal_translate -projwin "$x" "$y" "$x" "$y" -projwin_srs EPSG:3067 "$glare_file" "$out_glare"
      echo "GLARE raster cropped for $city -> $out_glare"
    else
      echo "GLARE base raster not found: $glare_file"
    fi
  else
    echo "Skipping GLARE crop for $city (already exists)"
  fi

done
