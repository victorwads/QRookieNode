#!/usr/bin/env bash

# install inkscape if not installed on linux or macos
if ! command -v inkscape &> /dev/null; then
  echo "Inkscape is not installed. Please install it."
  exit 1
fi

generate_one_icon() {
  mkdir -p "${1}x${1}"
  inkscape scalable/icon.svg -w "$1" -h "$1" -o "${1}x${1}/icon.png"
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

  rm -r "$iconset_dir"
}

# if [[ "$OSTYPE" == "linux-gnu"* ]]; then
#   generate_icons_linux
# elif
if [[ "$OSTYPE" == "darwin"* ]]; then
  generate_icons_macos
else
  echo "Sistema operacional não suportado."
  exit 1
fi