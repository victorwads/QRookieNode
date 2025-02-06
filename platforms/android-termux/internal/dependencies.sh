#!/bin/bash
apt update && apt upgrade -y
apt install -y \
  libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libx11-6 libxcomposite1 \
  libxdamage1 libxext6 libxfixes3 libxrandr2 libgbm1 libasound2 libdbus-1-3 \
  libgtk-3-0 libpango-1.0-0 libcairo2 libxkbcommon0 libxshmfence1 libxrender1 \
  libxcb1 libx11-xcb1 libxrandr2 libxcursor1 libxi6 libxss1 libxinerama1 \
  libwayland-client0 libwayland-server0 libxcomposite1 libxdamage1 \
  libxfixes3 libxext6 libxrandr2 libgbm1 libexpat1
