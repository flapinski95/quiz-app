up:
	docker-compose up -d

down:
	docker-compose down

down-volumes:
	docker-compose down -v

build:
	docker-compose build

rebuild:
	docker-compose down  && docker-compose build && docker-compose up -d

logs:
	docker-compose logs -f

keycloak-export:
	docker exec quizzapp-keycloak-1 /opt/keycloak/bin/kc.sh export \
		--dir /opt/keycloak/data/export \
		--realm master \
		--users realm_file
		
keycloak-backup: keycloak-export
	docker cp quizzapp-keycloak-1:/opt/keycloak/data/export ./keycloak/export

keycloak-import:
	docker exec quizzapp-keycloak-1 /opt/keycloak/bin/kc.sh import \
		--dir /opt/keycloak/data/export \
		--realm master \
		--override true
PLATFORMS=linux/amd64,linux/arm64

buildx-push:
	docker buildx build --platform $(PLATFORMS) -t flapinski95/gateway-service:k8s ./apps/gateway-service1 --push
	docker buildx build --platform $(PLATFORMS) -t flapinski95/frontend-service:k8s ./apps/frontend-service --push
	docker buildx build --platform $(PLATFORMS) -t flapinski95/quiz-service:k8s ./apps/quiz-service --push
	docker buildx build --platform $(PLATFORMS) -t flapinski95/quiz-session-service:k8s ./apps/quiz-session-service --push
	docker buildx build --platform $(PLATFORMS) -t flapinski95/user-service:k8s ./apps/user-service --push