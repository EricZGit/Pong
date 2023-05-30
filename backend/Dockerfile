FROM node:latest

# RUN mkdir -p /usr/src/app
WORKDIR /usr/src

RUN npm i -g @nestjs/cli
RUN nest new app -p npm
WORKDIR /usr/src/app
RUN npm install --save @nestjs/typeorm pg typeorm
COPY ./backsrc .

