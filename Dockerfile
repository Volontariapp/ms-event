FROM node:24-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN corepack enable && corepack prepare yarn@4.12.0 --activate

FROM base AS build-deps
COPY .yarn ./.yarn
COPY .yarnrc.yml yarn.lock package.json ./
RUN yarn install --immutable

FROM base AS builder
COPY --from=build-deps /app/node_modules ./node_modules
COPY . .
RUN yarn build
RUN rm -rf src test

FROM base AS prod-deps
COPY .yarn ./.yarn
COPY .yarnrc.yml yarn.lock package.json ./
RUN yarn workspaces focus --all --production && \
    yarn cache clean --all

FROM node:24-alpine AS runner
LABEL maintainer="Volontariapp"
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3003

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/config ./config
COPY --from=prod-deps --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=prod-deps --chown=nestjs:nodejs /app/package.json ./package.json

USER nestjs

EXPOSE 3003

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD node -e "fetch('http://localhost:3003/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

ENTRYPOINT ["node"]
CMD ["dist/main"]
