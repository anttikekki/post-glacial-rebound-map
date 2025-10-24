#!/bin/bash

# Exit if any command fails
set -euo pipefail

download_if_missing() {
    FILE_URL="$1"
    FILE_NAME="$2"

    if [ -f "$FILE_NAME" ]; then
        echo "$FILE_NAME already exists. Skipping."
        return
    fi

    echo "Downloading $FILE_NAME..."
    curl -L -o "$FILE_NAME" "$FILE_URL"
    echo "Downloaded $FILE_NAME"
}

# Version: 8.2.2025
download_if_missing  "https://drive.usercontent.google.com/download?id=1tevVugIi1v4TeatiqYG7QWACurmMm_YT&export=download&authuser=0&confirm=t&uuid=1a4cf95a-7760-4847-af4b-9b9f983d99d2&at=AN8xHorwQbFK55AhjOkl0Aqyyzin%3A1754324272036" "Base_Raster.tif"

# Version: 20.5.2025
download_if_missing "https://drive.usercontent.google.com/download?id=1guAZXghJH-2deMtG_zj8fq6niepdRORh&export=download&authuser=0" "sea-level-baltic.tif"