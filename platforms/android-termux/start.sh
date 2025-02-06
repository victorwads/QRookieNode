#!/bin/bash
# if not .setupDone, exec setup
cd internal
if [ ! -f ".setupDone" ]; then
  ./setup.sh
fi
cd ..

export PROOT_NO_SECCOMP=1
proot-distro login debian --bind ./:/app -- /app/internal/run.sh
unset PROOT_NO_SECCOMP