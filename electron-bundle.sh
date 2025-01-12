#!/bin/bash

rm -rf dist
yarn react:build
yarn electron:build
electron-builder

# if not ci, open macos app
if [ "$CI" != "true" ]; then
    ./dist/mac-arm64/QRookie.app/Contents/MacOS/QRookie
fi