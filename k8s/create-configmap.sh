#!/bin/bash

# Check if .env file exists
if [ ! -f ../.env ]; then
  echo "Error: .env file not found!"
  exit 1
fi

# Create ConfigMap YAML
echo "apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:" > app-config.yaml

# Read .env file and add each line to the ConfigMap
while IFS= read -r line || [[ -n "$line" ]]; do
  # Skip empty lines and comments
  if [[ -z "$line" || "$line" =~ ^# ]]; then
    continue
  fi
  
  # Extract key and value
  key=$(echo "$line" | cut -d= -f1)
  value=$(echo "$line" | cut -d= -f2-)
  
  # Add to ConfigMap
  echo "  $key: \"$value\"" >> app-config.yaml
done < ../.env

echo "ConfigMap created successfully as app-config.yaml" 