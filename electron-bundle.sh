#!/bin/bash

if [ "$1" != "--no-clean" ]; then
    rm -rf dist
fi

cd ./assets
bash icon_generator.sh
cd ..

ELECTRON_CACHE=".cache/electron"
ELETCRON_BUILDER_CACHE=".cache/electron-builder"

yarn install
yarn react:build
yarn electron:build
electron-builder --macos &
MACOS=$!
electron-builder --linux &
LINUX=$!
electron-builder --win &
WIN=$!

trap "kill $WIN $MACOS $LINUX" SIGINT

wait $WIN $MACOS $LINUX

# if not ci, open macos app
if [ "$CI" != "true" ]; then
    ./dist/mac-arm64/QRookie.app/Contents/MacOS/QRookie
fi