#!/bin/bash
cd "$(dirname "$0")/.."
fulldir="$(pwd)"

version="$(node -p -e "require('./package.json').version")"
dir="QRookieHeadless-$version"
zip="QRookieHeadless-$version.zip"

rm -rf "dist/$dir"
if [ ! -d "dist/server" ]; then
    yarn server:build
fi
if [ ! -d "dist/react" ]; then
    yarn react:build
fi

mkdir -p "dist/$dir/dist"
cp -r dist/server "dist/$dir/dist/"
cp -r dist/react "dist/$dir/dist/"

mkdir -p "dist/$dir/assets/images"
cp -r assets/images "dist/$dir/assets/"

cp platforms/headless/start.sh "dist/$dir"

echo "{\"version\":\"$version\",\"dependencies\":{\"7zip-bin\":\"^5.2.0\",\"node-7z\":\"^3.0.0\",\"ws\":\"^8.18.0\"}}" > "dist/$dir/package.json"
cd "dist/$dir"
yarn install --production

rm yarn.lock
chmod +x start.sh
chmod -R +x node_modules/7zip-bin/

cd "$fulldir/dist"
rm -f "$zip"
zip -r "$zip" "$dir"
