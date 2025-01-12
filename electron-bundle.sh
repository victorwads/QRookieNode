#!/bin/bash

if [ -x "$(command -v snapcraft)" ]; then
    brew install snapcraft
fi

# rm -rf dist
yarn install
yarn react:build
yarn electron:build
electron-builder --macos &
MACOS=$!
electron-builder --linux &
LINUX=$!
electron-builder --win
WIN=$!

wait $WIN $MACOS $LINUX

# if not ci, open macos app
if [ "$CI" != "true" ]; then
    ./dist/mac-arm64/QRookie.app/Contents/MacOS/QRookie
fi