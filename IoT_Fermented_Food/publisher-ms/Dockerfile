FROM node:20-alpine

WORKDIR /publisher-ms

COPY --chown=node:node *.json ./
RUN npm install --omit=dev

COPY --chown=node:node src src

USER node

CMD [ "npm", "start" ]
