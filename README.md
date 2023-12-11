# Development

## Docker virtual environment

> Environment it is substring in docker-compose.[ * ].yml

### Activate Development

```bash
source ./bin/activate dev
# or
. bin/activate dev
# or
echo "export DOCKER_VENV=dev" >> ~/.bashrc
. bin/activate
```

### Activate Production

```bash
source ./bin/activate prod
# or
. bin/activate prod
# or
echo "export DOCKER_VENV=prod" >> ~/.bashrc
. bin/activate
```

### Deactivate

```bash
deactivate  # in virtual environment
```

### Commands
```bash
build  # docker compose up -f ... --build --no-deps $1 -d
up  # docker compose -f ... up $1 -d
down  # docker compose -f ... down $1
logs  # docker logs "$project_name-$1-1" -f
bash  # docker exec -it "$project_name-$1-1" bash  # !IMPORTANT: be careful after activate it's not /bin/bash
shell  # docker exec -it "$project_name-$1-1" sh  # !IMPORTANT: be careful after activate it's not /bin/shell
```

## Migrate in virtual development environment

```bash
bash backend
npx prisma migrate dev
```

## Set password for root user in gitlab

see more in `gitlab-rail.sh`

## Documentation of API

- http://localhost:3000/api (Web view)
- http://localhost:3000/api-json (Download for Postman for example)
