SHELL := /bin/sh

COMPOSE := docker compose

.PHONY: setup up down stop reset build test status logs shell-db deploy-reto1 deploy-reto2 deploy-frontend

setup:
	@test -f .env || cp .env.example .env
	@echo "Configuracion lista. Revisa .env antes de iniciar."

up: setup
	$(COMPOSE) up --build -d
	$(COMPOSE) ps
	@echo "Frontend: http://localhost:$${FRONTEND_PORT:-4173}"

down:
	$(COMPOSE) down

stop:
	$(COMPOSE) stop

reset:
	$(COMPOSE) down -v --remove-orphans

build: setup
	$(COMPOSE) build

test:
	docker run --rm -v "$$(pwd)/reto1:/app" -w /app node:22-alpine sh -c 'npm ci && npm test'
	docker run --rm -v "$$(pwd)/reto2:/src" -w /src golang:1.22-alpine go test ./...

status:
	$(COMPOSE) ps

logs:
	$(COMPOSE) logs -f --tail=100

shell-db:
	$(COMPOSE) exec postgres psql -U "$${POSTGRES_USER:-interseguro}" -d "$${POSTGRES_DB:-interseguro}"

deploy-reto1:
	@test -n "$(PROJECT_ID)" || (echo "Uso: make deploy-reto1 PROJECT_ID=tu-proyecto" && exit 1)
	gcloud builds submit --tag us-central1-docker.pkg.dev/$(PROJECT_ID)/interseguro/reto1 ./reto1

deploy-reto2:
	@test -n "$(PROJECT_ID)" || (echo "Uso: make deploy-reto2 PROJECT_ID=tu-proyecto" && exit 1)
	gcloud builds submit --tag us-central1-docker.pkg.dev/$(PROJECT_ID)/interseguro/reto2 ./reto2

deploy-frontend:
	@test -n "VITE_API_URL" || (echo "Uso: make deploy-frontend VITE_API_URL=https://... VITE_ROUTE_API_URL=https://..." && exit 1)
	cd frontend && printf 'VITE_API_URL=%s\nVITE_ROUTE_API_URL=%s\n' "$(VITE_API_URL)" "$(VITE_ROUTE_API_URL)" > .env.production && npm ci && npm run build