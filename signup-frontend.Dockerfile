#######################
# SignUp Frontend Dockerfile #
#######################

FROM node:20 AS builder
WORKDIR /usr/src/app
COPY signup-frontend/package*.json ./signup-frontend/
WORKDIR /usr/src/app/signup-frontend
RUN npm ci
WORKDIR /usr/src/app
COPY signup-frontend/. ./signup-frontend
COPY shared/. ./shared
WORKDIR /usr/src/app/signup-frontend
RUN npx tsc -b && npx vite build


FROM nginx:stable-alpine
COPY --from=builder /usr/src/app/signup-frontend/dist /usr/share/nginx/html
COPY signup-frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY signup-frontend/env.sh /docker-entrypoint.d/env.sh
RUN chmod +x /docker-entrypoint.d/env.sh
EXPOSE 80

# define the command to start the app
CMD ["nginx", "-g", "daemon off;"]
