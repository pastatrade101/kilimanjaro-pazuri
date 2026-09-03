# syntax=docker/dockerfile:1

# better-sqlite3 is a native module, so the build stage needs a toolchain.
FROM node:22-bookworm-slim AS build
WORKDIR /app

RUN apt-get update \
 && apt-get install -y --no-install-recommends python3 make g++ ca-certificates \
 && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build && npm prune --omit=dev

# ---------------------------------------------------------------------------

FROM node:22-bookworm-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV BODY_SIZE_LIMIT=1M
# The enquiry rate limiter needs the real client address, not Caddy's.
ENV ADDRESS_HEADER=X-Forwarded-For
ENV XFF_DEPTH=1
# The villa's SQLite database lives on a mounted volume.
ENV DATABASE_PATH=/data/kilimanjaro-pazuri.db

COPY --from=build /app/build      ./build
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json

RUN mkdir -p /data && chown -R node:node /data /app
USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "build"]
