#!/usr/bin/env bash
cd "$(dirname "$0")"

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
  sizes=(16 32 48 64 128 256)
  for size in "${sizes[@]}"; do
    generate_one_icon "$size"
  done
}

generate_icons_macos() {
  iconset_dir="icon.iconset"
  png_filename="512x512/icon.png"
  mkdir -p "$iconset_dir"

  cp "$png_filename" "$iconset_dir/icon_256x256.png"

  sizes=(16 32 48 64 128 256)
  for size in "${sizes[@]}"; do
    sips -z "$size" "$size" "$png_filename" --out "${iconset_dir}/icon_${size}x${size}.png"
    retina_size=$((size * 2))
    sips -z "$retina_size" "$retina_size" "$png_filename" --out "${iconset_dir}/icon_${size}x${size}@2x.png"
  done

  iconutil -c icns -o "icon.icns" "$iconset_dir"
}

# if running on CI and Icons alvery exists, skip generating icons
if [[
  "$1" != "--force"
  && -d "16x16"
  && -d "32x32"
  && -d "48x48"
  && -d "64x64"
  && -d "128x128"
  && -d "192x192"
  && -d "256x256"
  && -d "512x512"
]]; then
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

generate_one_icon 192
generate_one_icon 512

cp "192x192/icon.png" "../public/logo192.png"
cp "512x512/icon.png" "../public/logo512.png"

if [[ "$OSTYPE" == "darwin"* ]]; then
  generate_icons_macos
fi

if [[ "$OSTYPE" == "linux-gnu"* || "$OSTYPE" == "darwin"* ]]; then
  generate_icons_linux
elif [[ "$OSTYPE" == "msys" ]]; then
  if ! command -v /c/Program\ Files/Inkscape/bin/inkscape.com &> /dev/null; then
    echo "Inkscape is not installed. Please install it."
    exit 1
  fi
fi