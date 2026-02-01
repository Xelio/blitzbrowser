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

RUN pnpm build

FROM base AS prod-deps

RUN pnpm install --prod --frozen-lockfile

FROM node:25-alpine

WORKDIR /app

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/build ./build 

CMD ["node", "build/index.js"]