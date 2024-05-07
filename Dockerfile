# BASE IMAGE
FROM node:18.12-alpine as base
WORKDIR /app
RUN apk add ffmpeg
RUN npm install -g yarn cross-env --force


## Dependecies
FROM base as deps
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN yarn install

RUN yarn global add husky
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./production/
RUN cd production && yarn install --production


## Builder
FROM base as builder
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN yarn build:payload && yarn build:server && yarn copyfiles


## Runtime Image
FROM base as runtime
LABEL org.opencontainers.image.source=https://github.com/looner-app/cms
ENV NODE_ENV=production

COPY package*.json ./

COPY --from=deps /app/production/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/build ./build
COPY --from=builder /app/src/assets/public ./public

EXPOSE 3001

CMD ["yarn", "serve"]
