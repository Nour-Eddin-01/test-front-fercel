DOCKER = docker
BACKEND_CONT = tradehub-backend
FRONTEND_CONT = tradehub-frontend
DB_CONT = tradehub-db

.PHONY: help build up down restart logs ps seed migrate studio clean fclean fix-perms install-local

help: 
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

make one: up migrate generate seed studio d

up:  
	docker compose up -d

down: 
	docker compose down

build: 
	docker compose build

restart: down up 


migrate: 
	docker exec -it $(BACKEND_CONT) npx prisma migrate dev

generate: 
	docker exec -it $(BACKEND_CONT) npx prisma generate

seed: 
	docker exec -it $(BACKEND_CONT) npx prisma db seed

studio: 
	docker exec -it $(BACKEND_CONT) npx prisma studio


logsb: 
	$(DOCKER) logs -f $(BACKEND_CONT)

logsf: 
	$(DOCKER) logs -f $(FRONTEND_CONT)

logsd: 
	$(DOCKER) logs -f $(DB_CONT)

logsn:
	$(DOCKER) logs -f tradehub-nginx

logsr: 
	$(DOCKER) logs -f tradehub-redis

ps: 
	$(DOCKER) ps

network: 
	$(DOCKER) network ls

volumes: 
	$(DOCKER) volume ls

images: 
	$(DOCKER) images

install-local: fix-perms 
	cd backend && npm install
	cd frontend && npm install
	cd backend && npx prisma generate
	@echo " VS Code should now be happy with local node_modules."


fix-perms: 
	sudo mkdir -p ./infrastructure/elk/elasticsearch/data
	sudo chown -R $$USER:$$USER .
	sudo chown -R 1000:1000 ./infrastructure/elk/elasticsearch/data
	@echo " Permissions reclaimed for $$USER"

clean: 
	docker compose down

fclean: 
	docker compose down -v --rmi all
	@echo " All containers, volumes, and images for this project deleted."

prune: 
	docker system prune -a --volumes
	docker system prune -af --volumes
	rm -rf ./infrastructure/elk/elasticsearch/data/*
	@echo " Docker system pruned and ELK data cleared."

fresh: fclean prune 