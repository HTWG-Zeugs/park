FROM node:20 AS builder
WORKDIR /usr/src/app
COPY backend/property-management/package*.json ./backend/property-management/
WORKDIR /usr/src/app/backend/property-management
RUN npm ci
WORKDIR /usr/src/app
COPY backend/property-management/. ./backend/property-management
COPY backend/shared/. ./backend/shared
COPY shared/. ./shared
WORKDIR /usr/src/app/backend/property-management
RUN npm run build


FROM node:20-alpine
WORKDIR /usr/src/app
COPY backend/property-management/package*.json ./
RUN npm install --only=production
COPY --from=builder /usr/src/app/backend/property-management/dist ./
EXPOSE 8080

ENTRYPOINT ["node","./backend/property-management/src/main.js"]