FROM node:18

WORKDIR /app

COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm i

COPY .env .env
COPY src src
COPY index.ts index.ts

COPY tsconfig.json tsconfig.json

EXPOSE 7008
CMD npm start
