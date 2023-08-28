# all: 
# 	docker compose up -d

# stop:
# 	docker compose down

# clean:
# 	docker compose down -v
# 	docker system prune -a -f

all:
	docker-compose  -f ./docker-compose.yml build --parallel --compress 
	docker-compose -f ./docker-compose.yml up 

clean:
	docker-compose -f ./docker-compose.yml down

fclean:
	docker-compose -f ./docker-compose.yml down -v --rmi all

re: fclean all

stop:
	docker kill $$(docker ps -qa)

delete:
	docker container prune -f
	docker system prune -a -f
	rm -rf backend/backsrc/vol/dist backend/backsrc/vol/node_modules
	find backend/backsrc/vol/images -type f ! -name 'default' -exec rm -f {} +
	
show:
	docker container ls -a
	docker image ls -a

rebdd:
	docker stop postgre
	docker rm postgre

push:    
	make fclean
	make delete
	git status
	
	git add *
	@read -p "Veuillez saisir le message de commit : (ou ctrl-c to cancel) " msg; \
	git commit -m "$$msg:"
	git push

gotoback:
	docker exec -it $(docker ps -f "name=backend" -q) bash

gotobdd:
	docker exec -it $(docker ps -f "name=postgre" -q) psql -U postgresuser -d postgresdb

.PHONY: all clean fclean re stop delete show push  gotoback rebdd gotobdd
