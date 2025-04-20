#!/bin/bash

# Navigate to server-side directory
cd server-side || exit

# Build the Docker image
docker build -t hikuley/watch-list-app-server:latest .

# Optional: Push to Docker Hub (uncomment if needed)
# docker push hikuley/watch-list-app-server:latest

echo "Docker image built successfully: hikuley/watch-list-app-server:latest"

docker push hikuley/watch-list-app:latest

echo "Docker image pushed successfully: hikuley/watch-list-app:latest"