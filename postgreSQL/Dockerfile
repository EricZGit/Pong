FROM postgres:latest

EXPOSE 5432


COPY init.sql /docker-entrypoint-initdb.d/init.sql
RUN chmod 777 /docker-entrypoint-initdb.d/init.sql
