FROM node:20 AS builder
WORKDIR /usr/src/app
COPY backend/infrastructure-administration/package*.json ./backend/infrastructure-administration/
WORKDIR /usr/src/app/backend/infrastructure-administration
RUN npm ci
WORKDIR /usr/src/app
COPY backend/infrastructure-administration/. ./backend/infrastructure-administration
COPY backend/shared/. ./backend/shared
COPY shared/. ./shared
WORKDIR /usr/src/app/backend/infrastructure-administration
RUN npm run build


FROM node:20-alpine
WORKDIR /usr/src/app
COPY backend/infrastructure-administration/package*.json ./
RUN npm install --only=production
COPY --from=builder /usr/src/app/backend/infrastructure-administration/dist ./
EXPOSE 8080

ENTRYPOINT ["node","./backend/infrastructure-administration/main.js"]