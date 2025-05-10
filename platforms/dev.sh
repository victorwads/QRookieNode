#!/bin/bash

# Use Repo directory
cd "$(dirname "$0")/.."

# Function to kill child processes when the main script ends
cleanup() {
    echo "Terminating all processes..."
    kill 0
    exit
}

wait_for_port() {
    local PORT=$1
    local RETRIES=30

    echo "Waiting for the React server on port $PORT..."

    for ((i=1; i<=RETRIES; i++)); do
        if nc -z localhost $PORT; then
            echo "React server is available on port $PORT."
            return 0
        fi
        echo "Attempt $i/$RETRIES: Server is not ready yet. Waiting..."
        sleep 0.5
    done

    echo "Error: React server did not become ready on port $PORT."
    exit 1
}

# Start the React server (yarn start) in the background
echo "Starting React..."
PORT=3000 yarn react:dev &
REACT_PID=$!

# Check if the React server is ready
wait_for_port 3000

# Start Electron in development mode
echo "Starting Electron..."
yarn electron:dev &
ELECTRON_PID=$!

# Wait for the processes (prevents the script from ending immediately)
wait $REACT_PID $ELECTRON_PID $TSC_PID
