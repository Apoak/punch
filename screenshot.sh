#!/bin/bash

SCREENSHOTS="/mnt/c/Users/andre/OneDrive_CalPoly/Pictures/Screenshots"
LINK_DIR="/home/apokerlu/claude_practice/uigen/screenshot"
LINK="$LINK_DIR/latest.png"

mkdir -p "$LINK_DIR"

latest=$(ls -t "$SCREENSHOTS"/*.png 2>/dev/null | head -1)

if [[ -z "$latest" ]]; then
  echo "No screenshots found in $SCREENSHOTS"
  exit 1
fi

ln -sf "$latest" "$LINK"
echo "Linked: $latest -> $LINK"