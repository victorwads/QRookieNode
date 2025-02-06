#!/bin/bash

# Use Repo directory
cd "$(dirname "$0")/.."

chmod -R +x platforms/android-termux
version="$(node -p -e "require('./package.json').version")"
dir="dist/QRookieAndroidTermux-$version.arm64"
zip="$dir.zip"

rm -rf "$dir"
if [ ! -d "dist/linux-arm64-unpacked" ]; then
    yarn bundle --linux
fi

cp -r dist/linux-arm64-unpacked "$dir"
cp -r platforms/android-termux/internal "$dir"
cp platforms/android-termux/start.sh "$dir/qrookie-node-headless"
mv "$dir/qrookie-node" "$dir/electron"

rm -f "$zip"
zip -r "$zip" dist/QRookieAndroidTermux-${version}.arm64