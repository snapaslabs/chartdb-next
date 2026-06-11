FROM node:24-alpine AS builder

WORKDIR /usr/src/app

COPY package.json package-lock.json .npmrc ./

ENV NODE_OPTIONS="--max-old-space-size=4096"

RUN npm ci

COPY . .

RUN npm run build

FROM node:24-alpine AS production

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/package.json /usr/src/app/package-lock.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/.next ./.next
COPY --from=builder /usr/src/app/public ./public
COPY --from=builder /usr/src/app/docker-entrypoint.sh ./docker-entrypoint.sh

RUN chmod +x docker-entrypoint.sh

ENV PORT=8080
ENV NODE_ENV=production

EXPOSE 8080

CMD ["./docker-entrypoint.sh"]
