#!/usr/bin/env bash

generateicon() {
  folder="${2}"
  mkdir -p "${folder}"
  if [[ "$OSTYPE" == "msys" ]]; then
    /c/Program\ Files/Inkscape/bin/inkscape.com scalable/icon.svg -w "$1" -h "$1" -o "${folder}/icon.png"
  else
    inkscape scalable/icon.svg -w "$1" -h "$1" -o "${folder}/icon.png"
  fi
}

generate_one_icon() {
  size="$1"
  generateicon "$1" "${size}x${size}"
}

generate_icons_linux() {
  sizes=(16 32 48 64 128 256 512)
  for size in "${sizes[@]}"; do
    generate_one_icon "$size"
  done
}

generate_icons_macos() {
  generate_one_icon "512"
  iconset_dir="icon.iconset"
  png_filename="512x512/icon.png"
  mkdir -p "$iconset_dir"

  cp "$png_filename" "$iconset_dir/icon_256x256.png"

  for size in "${sizes[@]}"; do
    if [ "$size" -ne 256 ]; then
      sips -z "$size" "$size" "$png_filename" --out "${iconset_dir}/icon_${size}x${size}.png"
    fi
    retina_size=$((size * 2))
    sips -z "$retina_size" "$retina_size" "$png_filename" --out "${iconset_dir}/icon_${size}x${size}@2x.png"
  done

  iconutil -c icns -o "icon.icns" "$iconset_dir"
}

# if running on CI and Icons alvery exists, skip generating icons
if [[ "$CI" == "true" && -d "16x16" && -d "32x32" && -d "48x48" && -d "64x64" && -d "128x128" && -d "256x256" && -d "512x512" ]]; then
  echo "Icons already exists. Skipping generating icons."
  exit 0
fi

# if inkscape is not installed, install it by platform
if ! command -v inkscape &> /dev/null; then
  if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    sudo apt-get install inkscape
  elif [[ "$OSTYPE" == "darwin"* ]]; then
    brew install inkscape
  fi
fi

if [[ "$OSTYPE" == "linux-gnu"* || "$OSTYPE" == "darwin"* ]]; then
  if ! command -v inkscape &> /dev/null; then
    echo "Inkscape is not installed. Please install it."
    exit 1
  fi
  generate_icons_linux
  generate_icons_macos
elif [[ "$OSTYPE" == "msys" ]]; then
  if ! command -v /c/Program\ Files/Inkscape/bin/inkscape.com &> /dev/null; then
    echo "Inkscape is not installed. Please install it."
    exit 1
  fi
fi

generateicon 512 "."
