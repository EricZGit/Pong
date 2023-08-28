FROM node:lts

WORKDIR /usr/src/app

COPY package*.json ./
# RUN npm install -g npm@9.3.1
RUN npm install @vue/cli -q -g --save-optional --no-warnings > /dev/null 2>&1
# RUN npm install nodejs-timer
# RUN npm install vue3-toastify
# RUN npm install -g socket.io
# RUN npm install socket.io-client --save-dev
# RUN npm install @types/socket.io-client -D
# RUN npm install --save-dev @types/socket.io-client

COPY . .

# RUN npm install
RUN npm i -q -S @vue/cli-service --no-warnings > /dev/null 2>&1
# RUN npm install jquery --save-dev
# RUN npx browserslist@latest --update-db --legacy-peer-deps
# CMD npm run build
