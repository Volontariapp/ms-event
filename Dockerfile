# Stage 1: Base image with shared configuration
FROM node:24-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app
# Enable Corepack for Yarn 4 support
RUN corepack enable && corepack prepare yarn@4.12.0 --activate

# Stage 2: Install all dependencies (including devDependencies for build)
FROM base AS build-deps
COPY .yarn ./.yarn
COPY .yarnrc.yml yarn.lock package.json ./
# Cache-mounted install to speed up repeated builds
RUN yarn install --immutable

# Stage 3: Build the application
FROM base AS builder
# Copy node_modules from build-deps to avoid re-installing
COPY --from=build-deps /app/node_modules ./node_modules
COPY . .
RUN yarn build
# Remove any remaining dev sources or cache to keep this stage clean for next copies
RUN rm -rf src test

# Stage 4: Production dependencies (truly pruned)
FROM base AS prod-deps
COPY .yarn ./.yarn
COPY .yarnrc.yml yarn.lock package.json ./
# Use workspace tools to prune production dependencies efficiently
RUN yarn plugin import workspace-tools && \
    yarn workspaces focus --all --production && \
    yarn cache clean --all

# Stage 5: Final optimized production image
FROM node:24-alpine AS runner
LABEL maintainer="Volontariapp"
WORKDIR /app

# Hardened production settings
ENV NODE_ENV=production
ENV PORT=3000

# Security: Use non-root user for process isolation
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Copy only strictly necessary runtime files
# Using --chown during copy to maintain strict permissions
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/config ./config
COPY --from=prod-deps --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=prod-deps --chown=nestjs:nodejs /app/package.json ./package.json

# Use the least-privileged user
USER nestjs

# Expose the service port
EXPOSE 3000

# Ultra-light health check using native fetch (built into Node 24)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD node -e "fetch('http://localhost:3000/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

# Minimal overhead execution entrypoint
ENTRYPOINT ["node"]
CMD ["dist/main"]
