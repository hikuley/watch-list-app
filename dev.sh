#!/bin/bash

# Get the directory of the script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Change to the project root directory
cd "$SCRIPT_DIR"

# if ./dev.sh start is called, start the services and run the nestjs server and react app
if [ "$1" = "start" ]; then
    # Start the Docker Compose stack if it's not already running
    if ! docker-compose ps | grep -q "Up"; then
        cd docker-compose && docker-compose up -d
        # Return to project root
        cd "$SCRIPT_DIR"
    fi
fi

# if ./dev.sh stop is called, stop the services and nestjs server and react app
if [ "$1" = "stop" ]; then
    # Just stop Docker Compose services, no need to run non-existent npm scripts
    cd docker-compose && docker-compose down
    # Return to project root
    cd "$SCRIPT_DIR"
    echo "All services should now be stopped"
fi

# if ./dev.sh restart is called, stop the services and nestjs server and react app and start the services and nestjs server and react app
if [ "$1" = "restart" ]; then
    ./dev.sh stop
    ./dev.sh start
fi
