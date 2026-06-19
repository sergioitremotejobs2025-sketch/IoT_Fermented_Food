# Build stage
FROM node:20-alpine AS build-step
WORKDIR /app
COPY iot-app/package*.json ./
RUN npm install --legacy-peer-deps
COPY iot-app/ .
RUN npx ng build --configuration production

# Final stage
FROM nginx:1.17.8-alpine
RUN rm /etc/nginx/conf.d/default.conf
COPY default.conf /etc/nginx/conf.d/
COPY --from=build-step /app/dist/v15-app/ /usr/share/nginx/html
