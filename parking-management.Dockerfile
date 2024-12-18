FROM node:20 AS builder
WORKDIR /usr/src/app
COPY backend/parking-management/package*.json ./backend/parking-management/
WORKDIR /usr/src/app/backend/parking-management
RUN npm ci
WORKDIR /usr/src/app
COPY backend/parking-management/. ./backend/parking-management
COPY backend/shared/. ./backend/shared
COPY shared/. ./shared
WORKDIR /usr/src/app/backend/parking-management
RUN npm run build


FROM node:20-alpine
WORKDIR /usr/src/app
COPY backend/parking-management/package*.json ./
RUN npm install --only=production
COPY --from=builder /usr/src/app/backend/parking-management/dist ./
EXPOSE 8080

ENTRYPOINT ["node","./backend/parking-management/main.js"]