FROM node:25-slim AS base

RUN npm install -g pnpm

COPY ./package.json ./package.json
COPY ./pnpm-lock.yaml ./pnpm-lock.yaml
COPY ./svelte.config.js ./svelte.config.js
COPY ./vite.config.ts ./vite.config.ts
COPY ./tsconfig.json ./tsconfig.json

FROM base AS build

RUN CI=true pnpm install --frozen-lockfile

COPY ./src ./src

RUN PORT=9998 pnpm build

FROM base AS prod-deps

RUN CI=true pnpm install --prod --frozen-lockfile

FROM node:25-alpine

COPY --from=prod-deps ./node_modules ./node_modules
COPY --from=build ./build ./

CMD ["node", "index.js"]