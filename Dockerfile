FROM node:24-alpine AS builder

ARG NEXT_PUBLIC_OPENAI_API_KEY
ARG NEXT_PUBLIC_OPENAI_API_ENDPOINT
ARG NEXT_PUBLIC_LLM_MODEL_NAME
ARG NEXT_PUBLIC_HIDE_CHARTDB_CLOUD
ARG NEXT_PUBLIC_DISABLE_ANALYTICS

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

ENV NODE_OPTIONS="--max-old-space-size=4096"

RUN npm ci

COPY . .

RUN echo "NEXT_PUBLIC_OPENAI_API_KEY=${NEXT_PUBLIC_OPENAI_API_KEY}" >> .env && \
    echo "NEXT_PUBLIC_OPENAI_API_ENDPOINT=${NEXT_PUBLIC_OPENAI_API_ENDPOINT}" >> .env && \
    echo "NEXT_PUBLIC_LLM_MODEL_NAME=${NEXT_PUBLIC_LLM_MODEL_NAME}" >> .env && \
    echo "NEXT_PUBLIC_HIDE_CHARTDB_CLOUD=${NEXT_PUBLIC_HIDE_CHARTDB_CLOUD}" >> .env && \
    echo "NEXT_PUBLIC_DISABLE_ANALYTICS=${NEXT_PUBLIC_DISABLE_ANALYTICS}" >> .env

RUN npm run build

FROM node:24-alpine AS production

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/package.json /usr/src/app/package-lock.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/.next ./.next
COPY --from=builder /usr/src/app/public ./public

ENV PORT=8080
ENV NODE_ENV=production

EXPOSE 8080

CMD ["sh", "-c", "npx next start -p ${PORT:-8080}"]
