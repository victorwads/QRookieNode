#!/bin/bash
cd "$(dirname "$0")"

unset PROOT_NO_SECCOMP
proot-distro install debian
proot-distro login debian --bind ../:/app -- /app/internal/dependencies.sh

echo "" > .setupDone