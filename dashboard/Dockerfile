FROM node:25-alpine AS base

WORKDIR /app

ENV CI=true

RUN npm install -g pnpm

COPY ./package.json ./package.json
COPY ./pnpm-lock.yaml ./pnpm-lock.yaml
COPY ./svelte.config.js ./svelte.config.js
COPY ./vite.config.ts ./vite.config.ts
COPY ./tsconfig.json ./tsconfig.json

FROM base AS build

RUN pnpm install --frozen-lockfile

COPY ./src ./src
COPY ./server.ts ./server.ts
COPY ./ws-proxy.ts ./ws-proxy.ts
COPY ./auth-check.ts ./auth-check.ts
COPY ./tsconfig.server.json ./tsconfig.server.json

RUN pnpm build && pnpm tsc -p tsconfig.server.json

FROM base AS prod-deps

RUN pnpm install --prod --frozen-lockfile

FROM node:25-alpine

WORKDIR /app

COPY --from=build /app/package.json ./package.json
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/build ./build
COPY --from=build /app/dist ./dist

CMD ["node", "dist/server.js"]