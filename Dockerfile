FROM node:current-alpine
RUN apk add --no-cache bash
COPY . /app
WORKDIR /app
EXPOSE 3000
RUN npm install
RUN npm run build