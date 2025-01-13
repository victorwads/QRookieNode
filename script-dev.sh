#!/bin/bash

# Função para matar os processos filhos quando o script principal terminar
cleanup() {
    echo "Encerrando todos os processos..."
    kill 0
    exit
}

wait_for_port() {
    local PORT=$1
    local RETRIES=30

    echo "Aguardando o servidor React na porta $PORT..."

    for ((i=1; i<=RETRIES; i++)); do
        if nc -z localhost $PORT; then
            echo "Servidor React disponível na porta $PORT."
            return 0
        fi
        echo "Tentativa $i/$RETRIES: Servidor ainda não está pronto. Aguardando..."
        sleep 0.5
    done

    echo "Erro: Servidor React não ficou pronto na porta $PORT."
    exit 1
}

# Iniciar o servidor React (yarn start) em segundo plano
echo "Iniciando React..."
PORT=3000 yarn react:dev &
REACT_PID=$!

# Verificar se o servidor React está pronto
wait_for_port 3000

# Iniciar o Electron no modo de desenvolvimento
echo "Iniciando Electron..."
yarn electron:dev &
ELECTRON_PID=$!

# Aguardar os processos (impede que o script termine imediatamente)
wait $REACT_PID $ELECTRON_PID $TSC_PID