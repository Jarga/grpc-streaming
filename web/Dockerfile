FROM node:11-alpine

WORKDIR /app

COPY .npmrc ./
COPY package*.json ./
RUN npm install

COPY ./ ./
CMD [ "node", "app.js" ]