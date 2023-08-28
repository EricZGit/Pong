FROM node:latest

WORKDIR /usr/src/app

#RUN npm install socket.io
#RUN npm install nodemon --save-dev
# CMD npm install && sleep 1d

RUN npm rebuild bcrypt --build-from-source

CMD npm install > /dev/null 2>&1 && npm run start 