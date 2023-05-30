all: 
	docker compose up -d

stop:
	docker compose down

clean:
	docker compose down -v
	docker system prune -a -f


# all:
# 	docker-compose -f ./docker-compose.yml up --build

# clean:
# 	docker-compose -f ./docker-compose.yml down

# fclean:
# 	docker-compose -f ./docker-compose.yml down -v --rmi all

# re: fclean all

# stop:
# 	docker kill $$(docker ps -q)

# delete:
# 	docker system prune -a -f
#	docker container prune -f
# 	docker rmi $$(docker images -q)

# show:
# 	docker container ls -a
# 	docker image ls -a

#.PHONY: all clean fclean re stop delete show