#!/bin/bash

# Kafka Docker Setup Script
# This script sets up and manages an Apache Kafka container in KRaft mode (no ZooKeeper)

# Configuration
KAFKA_CONTAINER_NAME="kafka-broker"
KAFKA_IMAGE="bitnami/kafka:latest"
KAFKA_PORT="9092"
DATA_DIR="./kafka-data"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Ensure required directories exist
mkdir -p $DATA_DIR

# Function to show usage information
show_usage() {
    echo -e "${YELLOW}Kafka Docker Management Script${NC}"
    echo "Usage: $0 [option]"
    echo "Options:"
    echo "  start    - Start the Kafka container"
    echo "  stop     - Stop the Kafka container"
    echo "  restart  - Restart the Kafka container"
    echo "  status   - Check if the Kafka container is running"
    echo "  logs     - View Kafka container logs"
    echo "  shell    - Access Kafka container shell"
    echo "  delete   - Delete the Kafka container (data persists)"
    echo "  purge    - Delete container and data (CAUTION: Data will be lost)"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}Error: Docker is not installed.${NC}"
        exit 1
    fi
}

# Start Kafka container
start_kafka() {
    echo -e "${YELLOW}Starting Kafka container...${NC}"

    if docker ps -a --format '{{.Names}}' | grep -q "^${KAFKA_CONTAINER_NAME}$"; then
        echo "Container already exists, starting it..."
        docker start $KAFKA_CONTAINER_NAME
    else
        echo "Creating and starting new Kafka container..."
        docker run --name $KAFKA_CONTAINER_NAME \
            -p $KAFKA_PORT:9092 \
            -v $DATA_DIR:/bitnami/kafka \
            -e KAFKA_CFG_NODE_ID=1 \
            -e KAFKA_CFG_PROCESS_ROLES=broker,controller \
            -e KAFKA_CFG_LISTENERS=PLAINTEXT://:9092,CONTROLLER://:9093 \
            -e KAFKA_CFG_ADVERTISED_LISTENERS=PLAINTEXT://localhost:9092 \
            -e KAFKA_CFG_CONTROLLER_QUORUM_VOTERS=1@localhost:9093 \
            -e KAFKA_CFG_CONTROLLER_LISTENER_NAMES=CONTROLLER \
            -d $KAFKA_IMAGE
    fi
}

# Stop Kafka container
stop_kafka() {
    echo -e "${YELLOW}Stopping Kafka container...${NC}"
    docker stop $KAFKA_CONTAINER_NAME
}

# Restart Kafka container
restart_kafka() {
    stop_kafka
    start_kafka
}

# Check Kafka container status
check_status() {
    if docker ps --format '{{.Names}}' | grep -q "^${KAFKA_CONTAINER_NAME}$"; then
        echo -e "${GREEN}Kafka container is running.${NC}"
    else
        echo -e "${RED}Kafka container is not running.${NC}"
    fi
}

# View Kafka logs
view_logs() {
    echo -e "${YELLOW}Showing Kafka logs...${NC}"
    docker logs $KAFKA_CONTAINER_NAME
}

# Access Kafka container shell
access_shell() {
    docker exec -it $KAFKA_CONTAINER_NAME sh
}

# Delete Kafka container
delete_container() {
    docker rm -f $KAFKA_CONTAINER_NAME
}

# Purge Kafka container and data
purge_kafka() {
    delete_container
    rm -rf $DATA_DIR
    echo -e "${GREEN}Kafka container and data deleted.${NC}"
}

# Main logic
check_docker

if [ $# -eq 0 ]; then
    show_usage
    exit 0
fi

case "$1" in
    start)
        start_kafka
        ;;
    stop)
        stop_kafka
        ;;
    restart)
        restart_kafka
        ;;
    status)
        check_status
        ;;
    logs)
        view_logs
        ;;
    shell)
        access_shell
        ;;
    delete)
        delete_container
        ;;
    purge)
        purge_kafka
        ;;
    *)
        show_usage
        exit 1
        ;;
esac

exit 0
