#!/bin/bash

# This script starts, stops, or purges all specified services (postgres, kafka, redis)
# Usage: ./dev.sh [start|stop|purge]
# Example: ./dev.sh start

# Check if exactly one argument is provided and if it is either 'start', 'stop', or 'purge'
if [ "$#" -ne 1 ] || [[ ! "$1" =~ ^(start|stop|purge)$ ]]; then
    echo "Usage: $0 [start|stop|purge]"
    exit 1
fi

# Store the action (start, stop, or purge) in a variable
action=$1

# Define an array of services to be managed
services=("postgres" "kafka" "redis")

# Inform the user about the action being performed
echo "Performing $action for all services..."

# Loop through each service and run the corresponding script with the action
for service in "${services[@]}"; do
    echo "Running $service-docker.sh $action"
    ./dev-env-scripts/$service-docker.sh $action
done

# Run docker ps to show the status of all containers after the action
docker ps