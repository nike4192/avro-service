## Start

```bash
docker compose up
```

## Migrate in development environment

```bash
docker exec -it avro-service-backend-1 bash
npx prisma migrate dev
```

## Documentation of API

- http://localhost:3000/api (Web view)
- http://localhost:3000/api-json (Download for Postman for example)
