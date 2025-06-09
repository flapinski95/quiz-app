FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

FROM node:20-alpine

ARG PORT=3001
ENV NODE_ENV=production
ENV PORT=$PORT

WORKDIR /app

COPY --from=builder /app .

HEALTHCHECK --interval=30s --timeout=10s --retries=3 CMD wget --quiet --tries=1 --spider http://localhost:$PORT || exit 1

EXPOSE $PORT

CMD ["node", "src/index.js"]