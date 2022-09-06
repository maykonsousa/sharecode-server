FROM node:16
WORKDIR /usr/src/app
COPY package*.json .
RUN yarn
COPY . .
CMD yarn migrate:dev && yarn start
