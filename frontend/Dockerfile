FROM node:latest

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install -g npm@9.3.1
RUN npm install @vue/cli -g -f 
COPY . .
RUN npm i -S @vue/cli-service
RUN npm run build

#-g pour effectuer une installation globale
#-f pour force
