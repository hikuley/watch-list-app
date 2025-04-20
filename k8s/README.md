# Kubernetes Deployment for Nest.js Application

This directory contains Kubernetes deployment files for a Nest.js application with PostgreSQL, Redis, and Apache Kafka.

## Prerequisites

- Kubernetes cluster (local or cloud-based)
- kubectl installed and configured
- Docker image of your Nest.js application
- .env file in the root directory of your project

## Setup Instructions

### 1. Create ConfigMap from .env file

First, make sure your `.env` file is in the root directory of your project. Then run:

```bash
cd k8s
chmod +x create-configmap.sh
./create-configmap.sh
kubectl apply -f app-config.yaml
```

### 2. Update Nest.js Deployment Image

Edit the `nestjs-deployment.yaml` file to replace the placeholders with your actual image name and tag:

```yaml
image: ${NESTJS_IMAGE_NAME}:${NESTJS_IMAGE_TAG}
```

For example:

```yaml
image: my-nestjs-app:latest
```

### 3. Deploy the Services

Apply all the Kubernetes manifests:

```bash
kubectl apply -f postgres-deployment.yaml
kubectl apply -f redis-deployment.yaml
kubectl apply -f kafka-deployment.yaml
kubectl apply -f nestjs-deployment.yaml
```

### 4. Verify Deployments

Check if all pods are running:

```bash
kubectl get pods
```

Check services:

```bash
kubectl get services
```

## Environment Variables

Make sure your `.env` file contains at least the following variables:

```
POSTGRES_USER=your_postgres_user
POSTGRES_PASSWORD=your_postgres_password
POSTGRES_DB=your_database_name
REDIS_PASSWORD=your_redis_password
```

Plus any other environment variables your Nest.js application needs.

## Accessing the Application

The Nest.js application is exposed through a ClusterIP service. To access it from outside the cluster, you can:

1. Create an Ingress resource (recommended for production)
2. Use port-forwarding for development:

```bash
kubectl port-forward service/nestjs-app-service 3000:80
```

Then access your application at http://localhost:3000 