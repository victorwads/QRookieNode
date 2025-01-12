#!/bin/bash

if [ "$1" != "--no-clean" ]; then
    rm -rf dist
fi

cd ./assets
bash icon_generator.sh
cd ..

export ELECTRON_CACHE=".cache/electron"
export ELETCRON_BUILDER_CACHE=".cache/electron-builder"

yarn install
yarn react:build
yarn electron:build