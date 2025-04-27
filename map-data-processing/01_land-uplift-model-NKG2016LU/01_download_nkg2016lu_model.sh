#!/bin/bash

# Exit if any command fail
set -euo pipefail

# Define variables
URL="https://www.lantmateriet.se/contentassets/58490c18f7b042e5aa4c38075c9d3af5/nkg2016lu-with-readme.zip"
FILENAME="nkg2016lu-with-readme.zip"
TARGET_DIR="nkg2016lu"

# Create target directory if it doesn't exist
mkdir -p "$TARGET_DIR"

# Check if file already exists
if [ -f "$FILENAME" ]; then
  echo "File $FILENAME already exists. Skipping download."
else
  echo "Downloading $FILENAME..."
  curl -L -o "$FILENAME" "$URL"
fi

# Unzip the file
echo "Unzipping $FILENAME into $TARGET_DIR..."
unzip -o "$FILENAME" -d "$TARGET_DIR"

echo "Done!"
