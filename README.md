# Watch List Web App

## Prepare Dev Environment

Give the script permission to execute:
```bash
chmod +x ./dev.sh 
```

Run the script to start the dev environment:
```bash
./dev.sh start 
```

After the script is executed, the following services will be started:
- PostgreSQL
- Redis
- Apache Kafka


Run server-side:

```bash
cd server-side && npm run start
```

Run ui-side:

```bash
cd server-ui && npm run dev
```