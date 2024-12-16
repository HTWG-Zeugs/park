FROM node:20 AS builder
WORKDIR /usr/src/app
COPY parking-management/package*.json ./parking-management/
WORKDIR /usr/src/app/parking-management
RUN npm ci
WORKDIR /usr/src/app
COPY parking-management/. ./parking-management
COPY shared/. ./shared
WORKDIR /usr/src/app/parking-management
RUN npm run build


FROM node:20-alpine
WORKDIR /usr/src/app
COPY parking-management/package*.json ./
RUN npm install --only=production
COPY --from=builder /usr/src/app/parking-management/dist ./
EXPOSE 6969

ENTRYPOINT ["node","./parking-management/main.js"]