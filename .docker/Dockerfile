# Unified Dockerfile for both front-page and docs-site
# Use build args to determine which site to build

# Build stage
FROM node:20-alpine AS builder

# Accept build arg for which app to build
ARG APP_NAME=front-page

WORKDIR /app

# Copy the specific app's package files
COPY ${APP_NAME}/package*.json ./

# Install dependencies
RUN npm ci || npm install

# Copy the specific app's source code
COPY ${APP_NAME}/ .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Accept build arg for which app we built
ARG APP_NAME=front-page

# Copy nginx config
COPY .docker/nginx.conf /etc/nginx/nginx.conf

# Copy built assets from build stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy any public assets that weren't included in build
COPY ${APP_NAME}/public /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]