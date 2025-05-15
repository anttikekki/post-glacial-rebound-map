#!/bin/bash

# Exit if any command fails
set -euo pipefail

download_if_missing() {
    FILE_ID="$1"
    FILE_NAME="$2"

    if [ -f "$FILE_NAME" ]; then
        echo "$FILE_NAME already exists. Skipping."
        return
    fi

    echo "Downloading $FILE_NAME..."
    curl -L -o "$FILE_NAME" "https://drive.google.com/uc?export=download&id=${FILE_ID}"
    echo "Downloaded $FILE_NAME"
}

download_if_missing "1mIOy3It63Q4rzEPrAdLltdXyhYORONq5" "Base_Raster.tif"
download_if_missing "1iecBOgDuota3UpJ5am97P4s4FD_jcVUD" "sea-level-baltic.tif"
