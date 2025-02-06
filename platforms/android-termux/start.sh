#!/bin/bash
# if not .setupDone, exec setup

export PROOT_NO_SECCOMP=1
proot-distro login debian --bind ./:/app -- /app/internal/run.sh
unset PROOT_NO_SECCOMP