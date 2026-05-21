# syntax=docker/dockerfile:1.7

# ---------- Stage 1: build ----------
FROM node:20-alpine AS build
WORKDIR /web

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---------- Stage 2: runtime ----------
FROM nginx:1.27-alpine AS runtime

# Replace default nginx config with our SPA-friendly one
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Built assets
COPY --from=build /web/dist /usr/share/nginx/html

EXPOSE 8080