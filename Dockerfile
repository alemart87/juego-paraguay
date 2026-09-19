FROM node:22-alpine AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts --no-audit --no-fund

FROM dependencies AS builder
WORKDIR /app
COPY . .
ENV NODE_ENV=production \
    NITRO_PRESET=node_server \
    VITE_AUTH_ENABLED=false
RUN npm run build:docker

FROM node:22-alpine AS production-dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts --no-audit --no-fund

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=10000 \
    PERSISTENT_DIR=/persistent \
    VITE_AUTH_ENABLED=false

COPY --from=production-dependencies /app/node_modules ./node_modules
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/migrations ./migrations
COPY --from=builder /app/public/battle ./public/battle
COPY --from=builder /app/scripts/migrate.mjs ./scripts/migrate.mjs
COPY --from=builder /app/scripts/migration-plan.mjs ./scripts/migration-plan.mjs
COPY --from=builder /app/scripts/seed-persistent.mjs ./scripts/seed-persistent.mjs
COPY --from=builder /app/docker-start.sh ./docker-start.sh
COPY package.json ./package.json

RUN chmod +x /app/docker-start.sh && mkdir -p /persistent
EXPOSE 10000
CMD ["/app/docker-start.sh"]
