FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# We'll use this container to run supertest against the orchestrator
CMD ["npm", "test"]
