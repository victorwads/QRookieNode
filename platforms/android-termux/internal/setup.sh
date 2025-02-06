#!/bin/bash
unset PROOT_NO_SECCOMP
proot-distro install debian
proot-distro login debian --bind ./:/app -- /app/dependencies.sh

echo "" > .setupDone