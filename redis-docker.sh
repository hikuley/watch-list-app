#!/bin/bash

# Redis Docker Setup Script
# This script sets up and manages a Redis database container

# Configuration (modify these values as needed)
REDIS_CONTAINER_NAME="redis-db"
REDIS_VERSION="7"
REDIS_PORT="6379"
REDIS_PASSWORD="securepassword"
DATA_DIR="./redis-data"
REDIS_CONF_DIR="./redis-conf"
REDIS_CONF_FILE="$REDIS_CONF_DIR/redis.conf"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Create directories if they don't exist
mkdir -p $DATA_DIR
mkdir -p $REDIS_CONF_DIR

# Check if redis.conf exists, if not create a basic one
if [ ! -f "$REDIS_CONF_FILE" ]; then
    echo "# Redis configuration file
port 6379
requirepass $REDIS_PASSWORD
appendonly yes
protected-mode yes
maxmemory 256mb
maxmemory-policy allkeys-lru" > $REDIS_CONF_FILE
    echo -e "${GREEN}Created default Redis configuration file at $REDIS_CONF_FILE${NC}"
fi

# Function to display usage information
show_usage() {
    echo -e "${YELLOW}Redis Docker Management Script${NC}"
    echo "Usage: $0 [option]"
    echo "Options:"
    echo "  start    - Start the Redis container"
    echo "  stop     - Stop the Redis container"
    echo "  restart  - Restart the Redis container"
    echo "  status   - Check if the Redis container is running"
    echo "  logs     - View Redis container logs"
    echo "  shell    - Access Redis container shell"
    echo "  cli      - Access Redis CLI (interactive terminal)"
    echo "  delete   - Delete the Redis container (data persists)"
    echo "  purge    - Delete container and data volume (CAUTION: Data will be lost)"
    echo "  monitor  - Launch Redis monitor to see real-time commands"
    echo "  info     - Show Redis server information"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}Error: Docker is not installed.${NC}"
        echo "Please install Docker first: https://docs.docker.com/get-docker/"
        exit 1
    fi
}

# Start Redis container
start_redis() {
    echo -e "${YELLOW}Starting Redis container...${NC}"

    # Check if container already exists
    if docker ps -a --format '{{.Names}}' | grep -q "^${REDIS_CONTAINER_NAME}$"; then
        echo "Container already exists, starting it..."
        docker start $REDIS_CONTAINER_NAME
    else
        echo "Creating and starting new Redis container..."
        docker run --name $REDIS_CONTAINER_NAME \
            -p $REDIS_PORT:6379 \
            -v $DATA_DIR:/data \
            -v $REDIS_CONF_FILE:/usr/local/etc/redis/redis.conf \
            -d redis:$REDIS_VERSION redis-server /usr/local/etc/redis/redis.conf
    fi

    # Check if container started successfully
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Redis container started successfully.${NC}"
        echo -e "Connection Details:"
        echo -e "  Host: localhost"
        echo -e "  Port: $REDIS_PORT"
        echo -e "  Password: $REDIS_PASSWORD"
        echo -e "  Connection string: redis://:$REDIS_PASSWORD@localhost:$REDIS_PORT"
    else
        echo -e "${RED}Failed to start Redis container.${NC}"
    fi
}

# Stop Redis container
stop_redis() {
    echo -e "${YELLOW}Stopping Redis container...${NC}"

    # Check if container exists and is running
    if docker ps --format '{{.Names}}' | grep -q "^${REDIS_CONTAINER_NAME}$"; then
        docker stop $REDIS_CONTAINER_NAME
        echo -e "${GREEN}Redis container stopped.${NC}"
    else
        echo -e "${YELLOW}Redis container is not running.${NC}"
    fi
}

# Restart Redis container
restart_redis() {
    echo -e "${YELLOW}Restarting Redis container...${NC}"
    stop_redis
    start_redis
}

# Check Redis container status
check_status() {
    if docker ps --format '{{.Names}}' | grep -q "^${REDIS_CONTAINER_NAME}$"; then
        echo -e "${GREEN}Redis container is running.${NC}"
        docker ps --filter name=$REDIS_CONTAINER_NAME
    elif docker ps -a --format '{{.Names}}' | grep -q "^${REDIS_CONTAINER_NAME}$"; then
        echo -e "${YELLOW}Redis container exists but is not running.${NC}"
        docker ps -a --filter name=$REDIS_CONTAINER_NAME
    else
        echo -e "${RED}Redis container does not exist.${NC}"
    fi
}

# View Redis logs
view_logs() {
    echo -e "${YELLOW}Showing Redis container logs...${NC}"
    docker logs $REDIS_CONTAINER_NAME
}

# Access Redis container shell
access_shell() {
    echo -e "${YELLOW}Accessing Redis container shell...${NC}"
    docker exec -it $REDIS_CONTAINER_NAME sh
}

# Access Redis CLI
access_cli() {
    echo -e "${YELLOW}Accessing Redis CLI...${NC}"
    docker exec -it $REDIS_CONTAINER_NAME redis-cli -a $REDIS_PASSWORD
}

# Redis monitor mode
redis_monitor() {
    echo -e "${YELLOW}Starting Redis monitor mode...${NC}"
    docker exec -it $REDIS_CONTAINER_NAME redis-cli -a $REDIS_PASSWORD monitor
}

# Redis info command
redis_info() {
    echo -e "${YELLOW}Fetching Redis server information...${NC}"
    docker exec $REDIS_CONTAINER_NAME redis-cli -a $REDIS_PASSWORD info
}

# Delete Redis container (keeps data volume)
delete_container() {
    echo -e "${YELLOW}Deleting Redis container...${NC}"

    if docker ps -a --format '{{.Names}}' | grep -q "^${REDIS_CONTAINER_NAME}$"; then
        docker stop $REDIS_CONTAINER_NAME 2>/dev/null
        docker rm $REDIS_CONTAINER_NAME
        echo -e "${GREEN}Redis container deleted.${NC}"
        echo -e "${YELLOW}Note: Data volume at '$DATA_DIR' was preserved.${NC}"
    else
        echo -e "${YELLOW}Redis container does not exist.${NC}"
    fi
}

# Delete Redis container and data volume
purge_redis() {
    echo -e "${RED}WARNING: This will delete the Redis container AND all data!${NC}"
    read -p "Are you sure you want to continue? (y/n): " confirm

    if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
        delete_container

        echo -e "${YELLOW}Removing data directory at '$DATA_DIR'...${NC}"
        rm -rf $DATA_DIR

        echo -e "${YELLOW}Removing config directory at '$REDIS_CONF_DIR'...${NC}"
        rm -rf $REDIS_CONF_DIR

        echo -e "${GREEN}Data and configuration directories removed.${NC}"
    else
        echo -e "${YELLOW}Operation canceled.${NC}"
    fi
}

# Main script logic
check_docker

if [ $# -eq 0 ]; then
    show_usage
    exit 0
fi

case "$1" in
    start)
        start_redis
        ;;
    stop)
        stop_redis
        ;;
    restart)
        restart_redis
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
    cli)
        access_cli
        ;;
    monitor)
        redis_monitor
        ;;
    info)
        redis_info
        ;;
    delete)
        delete_container
        ;;
    purge)
        purge_redis
        ;;
    *)
        show_usage
        exit 1
        ;;
esac

exit 0