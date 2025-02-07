#!/bin/bash
apt update && apt upgrade -y
apt install -y task-xfce-desktop
useradd -m -s /bin/bash rookie