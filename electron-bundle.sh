#!/bin/bash

yarn build:react
yarn build:electron
electron-builder

# if not ci, open macos app
if [ "$CI" != "true" ]; then
    ./dist/mac-arm64/QRookie.app/Contents/MacOS/QRookie
fi