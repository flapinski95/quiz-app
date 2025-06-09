FROM node:20 AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

FROM node:20 AS dev
WORKDIR /app

ENV NODE_ENV=development
RUN npm install --save-dev nodemon
COPY --from=builder /app .

EXPOSE 3003
CMD ["npx", "nodemon", "src/index.js"]

FROM node:20-slim AS runner
WORKDIR /app

ARG PORT=3003
ENV PORT=$PORT
ENV NODE_ENV=production

COPY --from=builder /app .

EXPOSE $PORT
CMD ["node", "src/index.js"]