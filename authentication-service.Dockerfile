FROM node:20 AS builder
WORKDIR /usr/src/app
COPY backend/authentication/package*.json ./backend/authentication/
WORKDIR /usr/src/app/backend/authentication
RUN npm ci
WORKDIR /usr/src/app
COPY backend/authentication/. ./backend/authentication
COPY backend/shared/. ./backend/shared
COPY shared/. ./shared
WORKDIR /usr/src/app/backend/authentication
RUN npm run build


FROM node:20-alpine
WORKDIR /usr/src/app
COPY backend/authentication/package*.json ./
RUN npm install --only=production
COPY --from=builder /usr/src/app/backend/authentication/dist ./
EXPOSE 6969

ENTRYPOINT ["node","./backend/authentication/main.js"]