#!/bin/bash

# PostgreSQL Docker Setup Script
# This script sets up and manages a PostgreSQL database container

# Configuration (modify these values as needed)
POSTGRES_CONTAINER_NAME="postgres-db"
POSTGRES_VERSION="15"
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="securepassword"
POSTGRES_DB="mydatabase"
POSTGRES_PORT="5432"
DATA_DIR="./postgres-data"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Create data directory if it doesn't exist
mkdir -p $DATA_DIR

# Function to display usage information
show_usage() {
    echo -e "${YELLOW}PostgreSQL Docker Management Script${NC}"
    echo "Usage: $0 [option]"
    echo "Options:"
    echo "  start    - Start the PostgreSQL container"
    echo "  stop     - Stop the PostgreSQL container"
    echo "  restart  - Restart the PostgreSQL container"
    echo "  status   - Check if the PostgreSQL container is running"
    echo "  logs     - View PostgreSQL container logs"
    echo "  shell    - Access PostgreSQL container shell"
    echo "  psql     - Access PostgreSQL interactive terminal"
    echo "  delete   - Delete the PostgreSQL container (data persists)"
    echo "  purge    - Delete container and data volume (CAUTION: Data will be lost)"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}Error: Docker is not installed.${NC}"
        echo "Please install Docker first: https://docs.docker.com/get-docker/"
        exit 1
    fi
}

# Start PostgreSQL container
start_postgres() {
    echo -e "${YELLOW}Starting PostgreSQL container...${NC}"

    # Check if container already exists
    if docker ps -a --format '{{.Names}}' | grep -q "^${POSTGRES_CONTAINER_NAME}$"; then
        echo "Container already exists, starting it..."
        docker start $POSTGRES_CONTAINER_NAME
    else
        echo "Creating and starting new PostgreSQL container..."
        docker run --name $POSTGRES_CONTAINER_NAME \
            -e POSTGRES_USER=$POSTGRES_USER \
            -e POSTGRES_PASSWORD=$POSTGRES_PASSWORD \
            -e POSTGRES_DB=$POSTGRES_DB \
            -v $DATA_DIR:/var/lib/postgresql/data \
            -p $POSTGRES_PORT:5432 \
            -d postgres:$POSTGRES_VERSION
    fi

    # Check if container started successfully
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}PostgreSQL container started successfully.${NC}"
        echo -e "Connection Details:"
        echo -e "  Host: localhost"
        echo -e "  Port: $POSTGRES_PORT"
        echo -e "  User: $POSTGRES_USER"
        echo -e "  Password: $POSTGRES_PASSWORD"
        echo -e "  Database: $POSTGRES_DB"
        echo -e "  Connection string: postgresql://$POSTGRES_USER:$POSTGRES_PASSWORD@localhost:$POSTGRES_PORT/$POSTGRES_DB"
    else
        echo -e "${RED}Failed to start PostgreSQL container.${NC}"
    fi
}

# Stop PostgreSQL container
stop_postgres() {
    echo -e "${YELLOW}Stopping PostgreSQL container...${NC}"

    # Check if container exists and is running
    if docker ps --format '{{.Names}}' | grep -q "^${POSTGRES_CONTAINER_NAME}$"; then
        docker stop $POSTGRES_CONTAINER_NAME
        echo -e "${GREEN}PostgreSQL container stopped.${NC}"
    else
        echo -e "${YELLOW}PostgreSQL container is not running.${NC}"
    fi
}

# Restart PostgreSQL container
restart_postgres() {
    echo -e "${YELLOW}Restarting PostgreSQL container...${NC}"
    stop_postgres
    start_postgres
}

# Check PostgreSQL container status
check_status() {
    if docker ps --format '{{.Names}}' | grep -q "^${POSTGRES_CONTAINER_NAME}$"; then
        echo -e "${GREEN}PostgreSQL container is running.${NC}"
        docker ps --filter name=$POSTGRES_CONTAINER_NAME
    elif docker ps -a --format '{{.Names}}' | grep -q "^${POSTGRES_CONTAINER_NAME}$"; then
        echo -e "${YELLOW}PostgreSQL container exists but is not running.${NC}"
        docker ps -a --filter name=$POSTGRES_CONTAINER_NAME
    else
        echo -e "${RED}PostgreSQL container does not exist.${NC}"
    fi
}

# View PostgreSQL logs
view_logs() {
    echo -e "${YELLOW}Showing PostgreSQL container logs...${NC}"
    docker logs $POSTGRES_CONTAINER_NAME
}

# Access PostgreSQL container shell
access_shell() {
    echo -e "${YELLOW}Accessing PostgreSQL container shell...${NC}"
    docker exec -it $POSTGRES_CONTAINER_NAME bash
}

# Access PostgreSQL interactive terminal
access_psql() {
    echo -e "${YELLOW}Accessing PostgreSQL interactive terminal...${NC}"
    docker exec -it $POSTGRES_CONTAINER_NAME psql -U $POSTGRES_USER -d $POSTGRES_DB
}

# Delete PostgreSQL container (keeps data volume)
delete_container() {
    echo -e "${YELLOW}Deleting PostgreSQL container...${NC}"

    if docker ps -a --format '{{.Names}}' | grep -q "^${POSTGRES_CONTAINER_NAME}$"; then
        docker stop $POSTGRES_CONTAINER_NAME 2>/dev/null
        docker rm $POSTGRES_CONTAINER_NAME
        echo -e "${GREEN}PostgreSQL container deleted.${NC}"
        echo -e "${YELLOW}Note: Data volume at '$DATA_DIR' was preserved.${NC}"
    else
        echo -e "${YELLOW}PostgreSQL container does not exist.${NC}"
    fi
}

# Delete PostgreSQL container and data volume
purge_postgres() {
    echo -e "${RED}WARNING: This will delete the PostgreSQL container AND all data!${NC}"
    read -p "Are you sure you want to continue? (y/n): " confirm

    if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
        delete_container

        echo -e "${YELLOW}Removing data directory at '$DATA_DIR'...${NC}"
        rm -rf $DATA_DIR
        echo -e "${GREEN}Data directory removed.${NC}"
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
        start_postgres
        ;;
    stop)
        stop_postgres
        ;;
    restart)
        restart_postgres
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
    psql)
        access_psql
        ;;
    delete)
        delete_container
        ;;
    purge)
        purge_postgres
        ;;
    *)
        show_usage
        exit 1
        ;;
esac

exit 0