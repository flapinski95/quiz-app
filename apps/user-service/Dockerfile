FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
ENV DATABASE_URL=postgresql://flapinski:cyckidupcia@postgres:5432/wordmaster

RUN npx prisma generate

FROM node:20-alpine AS dev
WORKDIR /app

ENV NODE_ENV=development
EXPOSE 3002

COPY --from=builder /app /app

CMD ["sh", "-c", "npx prisma migrate deploy && npx nodemon src/index.js"]

FROM node:20-alpine AS prod
WORKDIR /app

ARG PORT=3002
ENV PORT=${PORT}
ENV NODE_ENV=production

COPY --from=builder /app /app

EXPOSE ${PORT}
CMD ["npm", "start"]