#!/bin/bash

set -e

# Source directories
UI_BUILD_DIR="../../ui/public"
STAC_BUILD_DIR="../../map-data-processing/08_stac-catalog/stac"

# Target directory
TARGET="public"

echo "Cleaning $TARGET..."
rm -rf "$TARGET"

echo "Creating $TARGET..."
mkdir -p "$TARGET"

echo "Copying from $UI_BUILD_DIR..."
cp -R "$UI_BUILD_DIR"/. "$TARGET"/

echo "Copying from $STAC_BUILD_DIR..."
cp -R "$STAC_BUILD_DIR"/. "$TARGET"/stac

echo "Done."