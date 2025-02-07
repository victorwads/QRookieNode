#!/bin/bash

if ! command -v node &> /dev/null; then
  if [ ! -d "/data/data/com.termux" ]; then
    echo "This script is only fully resolvable in Termux, Node.js is not installed, please install it manually and run this script again"
    exit 1
  fi
  echo "Node.js is not installed, installing"
  pkg install nodejs-lts -y
fi

if ! command -v yarn &> /dev/null; then
  echo "Yarn is not installed, installing"
  npm install -g npm yarn
fi

node dist/electron/index.js