#!/bin/bash
# Script to rebuild and restart the Expenses Tracker container

# Unset DOCKER_HOST to use native Docker instead of broken Podman socket
unset DOCKER_HOST

cd /home/rshazow/Expenses-tracker

# Stop and remove the existing container
docker compose down

# Remove the old image
docker compose build --no-cache

# Start the container
docker compose up -d

# Show logs
docker compose logs -f
