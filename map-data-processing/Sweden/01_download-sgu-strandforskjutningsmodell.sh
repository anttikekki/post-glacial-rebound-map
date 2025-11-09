#!/bin/bash
# Script: download_strandforskjutningsmodell.sh
# Description: Downloads and unzips the SGU strandforskjutningsmodell dataset.
# Usage: ./download_strandforskjutningsmodell.sh

URL="https://resource.sgu.se/data/oppnadata/strandforskjutningsmodell/strandforskjutningsmodell.zip"
ZIPFILE="strandforskjutningsmodell.zip"
FOLDER="strandforskjutningsmodell"

# Step 1: Download if ZIP file does not exist
if [ -f "$ZIPFILE" ]; then
  echo "File '$ZIPFILE' already exists. Skipping download."
else
  echo "Downloading $ZIPFILE ..."
  curl -L -o "$ZIPFILE" "$URL"
  if [ $? -ne 0 ]; then
    echo "Error: Download failed."
    exit 1
  fi
fi

# Step 1.5: Verify ZIP file integrity
if ! unzip -tq "$ZIPFILE" >/dev/null 2>&1; then
  echo "Error: '$ZIPFILE' is not a valid ZIP archive or is corrupted."
  exit 2
fi

# Step 2: Unzip if folder does not exist
if [ -d "$FOLDER" ]; then
  echo "Folder '$FOLDER' already exists. Skipping unzip."
else
  echo "Unzipping $ZIPFILE into $FOLDER ..."
  mkdir -p "$FOLDER"
  unzip -q "$ZIPFILE" -d "$FOLDER"
  if [ $? -eq 0 ]; then
    echo "Unzip completed successfully."
  else
    echo "Error: Unzip failed."
    exit 3
  fi
fi
