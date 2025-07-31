#!/bin/bash

# Exit on errors, unset vars, or failed pipes
set -euo pipefail

# Create output folders
mkdir -p cropped-elevation_model
mkdir -p cropped_gdal_raster

# Input data
read -r -d '' DATA << EOM
Hamina 510906.2341 6714794.2756 L5
Helsinki 386487.1388 6672246.9518 L4
Hanko 273487.5128 6638619.3404 K3
Maarianhamina 107580.3684 6683266.968 L2
Turku 240460.6331 6711046.6297 L3
Pori 222936.1255 6828302.4566 M3
Kristiinankaupunki 208333.4066 6917198.0948 N3
Vaasa 228030.991 7007534.1587 P3
Kokkola 309852.1837 7084528.9155 Q4
Oulu 427776.3745 7211251.3808 R4
Tornio 369605.287 7306152.4385 S4
Rovaniemi 443428.351 7375625.1972 T4
EOM

# Loop through each line
while IFS= read -r line; do
  city=$(echo "$line" | awk '{print $1}')
  x=$(echo "$line" | awk '{print $2}')
  y=$(echo "$line" | awk '{print $3}')
  mapSheet=$(echo "$line" | awk '{print $4}')

  vrt_file="../01_download-nls-elevation-model-2m/vrt/whole-Finland/${mapSheet}.vrt"
  glare_file="../02_post-glacial-rebound-calculation-V2/01_download-GLARE-model-data/Base-raster-tm35fin.tif"

  out_vrt="cropped-elevation_model/${city}.tif"
  out_glare="cropped_gdal_raster/${city}.tif"

  # ---- Crop VRT tile if result doesn't exist
  if [[ ! -f "$out_vrt" ]]; then
    if [[ -f "$vrt_file" ]]; then
      gdal_translate -projwin $x $y $x $y -projwin_srs EPSG:3067 "$vrt_file" "$out_vrt"
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
      gdal_translate -projwin $x $y $x $y -projwin_srs EPSG:3067 "$glare_file" "$out_glare"
      echo "GLARE raster cropped for $city -> $out_glare"
    else
      echo "GLARE base raster not found: $glare_file"
    fi
  else
    echo "Skipping GLARE crop for $city (already exists)"
  fi

done <<< "$DATA"
