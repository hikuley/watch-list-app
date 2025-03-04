# Watch List Web App

## Setting Up the Development Environment

Grant execution permission to the script:
```bash
chmod +x ./dev.sh 
```

Start the development environment by running the script:
```bash
./dev.sh start 
```

This will initialize the following services:
- PostgreSQL
- Redis
- Apache Kafka

## Database Integration
Before starting the server, integrate the database by running:
```bash
cd server-side && npm run database-integrate
```

Run server-side:
```bash
cd server-side && npm run start
```

Run ui-side:
```bash
cd server-ui && npm run dev
```