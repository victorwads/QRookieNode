#!/bin/bash
unset PROOT_NO_SECCOMP
proot-distro install debian
proot-distro login debian --bind ./:/app -- /app/internal/dependencies.sh

echo "" > .setupDone