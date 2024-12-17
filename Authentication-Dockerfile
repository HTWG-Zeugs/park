######################
# Backend Dockerfile #
######################

FROM node:20 AS builder
WORKDIR /usr/src/app
COPY ./backend/authentication/package*.json ./backend/
WORKDIR /usr/src/app/backend/
RUN npm ci
WORKDIR /usr/src/app
COPY ./backend/authentication/. ./backend
COPY ./shared/. ./shared
WORKDIR /usr/src/app/backend
RUN npm run build


FROM node:20-alpine
WORKDIR /usr/src/app
COPY ./backend/authentication/package*.json ./
RUN npm install --only=production
COPY --from=builder /usr/src/app/backend/dist ./
EXPOSE 6969

ENTRYPOINT ["node","./backend/main.ts"]