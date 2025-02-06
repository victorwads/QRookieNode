#!/bin/bash
if [ ! -d "/data/data/com.termux" ]; then
  echo "This script is only for runing in Termux, for runing inside andronix, proot, etc, use open ./electron bin instead"
  exit 1
fi

if ! command -v proot-distro &> /dev/null; then
  echo "proot-distro is not installed, installing..."
  pkg install proot-distro -y
fi

cd "$(dirname "$0")/internal"
if [ ! -f ".setupDone" ]; then
  ./setup.sh
fi
cd ..

export PROOT_NO_SECCOMP=1
proot-distro login debian --bind ./:/app -- /app/internal/run.sh
unset PROOT_NO_SECCOMP