FROM node:11-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY ./ ./
RUN npm run build

CMD [ "node", "app.js" ]