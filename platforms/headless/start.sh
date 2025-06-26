#!/bin/bash
cd "$(dirname "$0")"

check_command() {
  command -v "$1" >/dev/null 2>&1
}

if ! check_command node || ! check_command yarn || ! check_command which || ! check_command 7za; then
  if [ ! -d "/data/data/com.termux" ]; then
    echo "This script is only fully auto resolvable in Termux."
    echo "Please ensure that the following binaries are available: node, yarn, which, 7za"
    exit 1
  fi

  echo "Installing missing dependencies in Termux..."
  export DEBIAN_FRONTEND=noninteractive
  termux-change-repo
  yes "y" | pkg update -y
  yes "y" | pkg install nodejs-lts yarn which p7zip -y
fi

if ! check_command yarn; then
  echo "Yarn is not installed, installing..."
  npm install -g npm yarn
fi

node dist/server/index.js "$@"
