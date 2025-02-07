#!/bin/bash

# if ! command -v node &> /dev/null; then or which not found
if [ !command -v node &> /dev/null || !command -v yarn &> /dev/null || !command -v which &> /dev/null || !command -v 7za &> /dev/null ]; then
  if [ ! -d "/data/data/com.termux" ]; then
    echo "This script is only fully resolvable in Termux, please provide the following binaries manually: node, yarn, which, 7za"
    exit 1
  fi
  echo "Node.js is not installed, installing"
  pkg update -y
  pkg install nodejs-lts yarn which -y
fi

if ! command -v yarn &> /dev/null; then
  echo "Yarn is not installed, installing"
  npm install -g npm yarn
fi

node dist/electron/index.js