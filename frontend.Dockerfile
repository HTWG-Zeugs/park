#######################
# Frontend Dockerfile #
#######################

FROM node:20 AS builder
WORKDIR /usr/src/app
COPY frontend/package*.json ./frontend/
WORKDIR /usr/src/app/frontend
RUN npm ci
WORKDIR /usr/src/app
COPY frontend/. ./frontend
COPY shared/. ./shared
WORKDIR /usr/src/app/frontend
RUN npx tsc -b && npx vite build


FROM nginx:stable-alpine
COPY --from=builder /usr/src/app/frontend/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY frontend/env.sh /docker-entrypoint.d/env.sh
RUN chmod +x /docker-entrypoint.d/env.sh
EXPOSE 80

# define the command to start the app
CMD ["nginx", "-g", "daemon off;"]
