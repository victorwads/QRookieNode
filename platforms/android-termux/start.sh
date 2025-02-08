#!/bin/bash

# Verifica se os comandos existem corretamente
check_command() {
  command -v "$1" >/dev/null 2>&1
}

# Se algum dos comandos essenciais estiver faltando
if ! check_command node || ! check_command yarn || ! check_command which || ! check_command 7za; then
  # Verifica se está rodando no Termux
  if [ ! -d "/data/data/com.termux" ]; then
    echo "This script is only fully auto resolvable in Termux."
    echo "Please provide the following binaries manually: node, yarn, which, 7za"
    exit 1
  fi

  echo "Installing missing dependencies in Termux..."
  export DEBIAN_FRONTEND=noninteractive
  yes "y" | pkg update -y
  yes "y" | pkg install nodejs-lts yarn which p7zip -y
fi

# Garante que o Yarn está instalado corretamente
if ! check_command yarn; then
  echo "Yarn is not installed, installing..."
  npm install -g npm yarn
fi

# Executa o Node.js dentro do projeto
node dist/electron/index.js