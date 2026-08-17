# Stage 1 - build tinh bang Vite. Playwright (devDependency, dung de test)
# khong can tai browser trong luc build image - PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD
# tranh ton thoi gian/dung luong build khong can thiet.
FROM node:20-slim AS build
WORKDIR /app
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
COPY package*.json ./
RUN npm ci
COPY . .
# /api la duong dan tuong doi - Nginx o stage 2 se proxy /api/* sang backend,
# nen build khong can biet truoc domain/IP that cua server.
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
# Dung cho canonical/OG URL tinh trong index.html (%VITE_SITE_URL%, xem
# Seo.jsx/index.html) - phai khop CLIENT_URL cua backend, truyen qua
# docker-compose.yml luc build.
ARG VITE_SITE_URL=http://localhost
ENV VITE_SITE_URL=$VITE_SITE_URL
RUN npm run build

# Stage 2 - phuc vu file tinh + reverse proxy /api sang backend qua Nginx.
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
