FROM node:16.3-alpine

WORKDIR /app

COPY --chown=node:node package*.json ./
RUN npm install --omit=dev

COPY --chown=node:node . .

USER node

CMD [ "npm", "start" ]
