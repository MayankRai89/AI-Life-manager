# Multi-stage Dockerfile for AI Life Manager Backend

# Stage 1: Build & Dependencies
FROM node:20-alpine AS dependencies
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Stage 2: Production Runner
FROM node:20-alpine AS runner
WORKDIR /usr/src/app

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000

# Security: Don't run as root user
USER node

# Copy dependencies and application source
COPY --chown=node:node --from=dependencies /usr/src/app/node_modules ./node_modules
COPY --chown=node:node package*.json ./
COPY --chown=node:node server.js ./
COPY --chown=node:node src/ ./src/

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]
