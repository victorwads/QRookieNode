#!/bin/bash

# Use Repo directory
cd "$(dirname "$0")/.."

if [ "$1" != "--no-clean" ]; then
    rm -rf dist
fi

cd ./assets
bash icon_generator.sh
cd ..

chmod +x -R platforms/ node_modules/7zip-bin/linux node_modules/7zip-bin/mac

export ELECTRON_CACHE=".cache/electron"
export ELETCRON_BUILDER_CACHE=".cache/electron-builder"

yarn install
yarn react:build
yarn electron:build