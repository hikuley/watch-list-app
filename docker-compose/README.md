# Docker Compose Setup for Development Environment

This Docker Compose configuration provides a development environment with:
- Apache Kafka (bitnami/kafka:latest)
- Redis 7
- PostgreSQL 15

## Prerequisites

- Docker and Docker Compose installed on your system

## Getting Started

1. Start all services:
   ```
   cd docker-compose
   docker-compose up -d
   ```

2. To see the status of running containers:
   ```
   docker-compose ps
   ```

3. View logs for a specific service:
   ```
   docker-compose logs <service-name>
   ```
   Where `<service-name>` is one of: `kafka-broker`, `redis-db`, or `postgres-db`

4. Stop all services:
   ```
   docker-compose down
   ```

## Service Details

### Kafka
- Port: 9092
- Container name: kafka-broker
- Data directory: ./kafka-data

### Redis
- Port: 6379
- Container name: redis-db
- Password: securepassword
- Connection string: redis://:securepassword@localhost:6379
- Data directory: ./redis-data
- Configuration file: ./redis-conf/redis.conf

### PostgreSQL
- Port: 5432
- Container name: postgres-db
- Username: postgres
- Password: securepassword
- Database: mydatabase
- Connection string: postgresql://postgres:securepassword@localhost:5432/mydatabase
- Data directory: ./postgres-data

## Accessing Services

### Kafka
You can use any Kafka client to connect to the broker on localhost:9092

### Redis
Access Redis CLI:
```
docker-compose exec redis-db redis-cli -a securepassword
```

### PostgreSQL
Access PostgreSQL interactive terminal:
```
docker-compose exec postgres-db psql -U postgres -d mydatabase
``` 