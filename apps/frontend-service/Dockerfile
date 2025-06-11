FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install

# --- Builder: build ze 100% czystym środowiskiem i sprawdzonymi zmiennymi
FROM node:20-alpine AS builder
WORKDIR /app
ARG NEXT_PUBLIC_GATEWAY_URL
ARG NEXT_PUBLIC_KEYCLOAK_URL

ENV NEXT_PUBLIC_GATEWAY_URL=$NEXT_PUBLIC_GATEWAY_URL
ENV NEXT_PUBLIC_KEYCLOAK_URL=$NEXT_PUBLIC_KEYCLOAK_URL
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 💣 Zawsze czyść .next, by nie mieć śmieci z poprzedniego buildu
RUN rm -rf .next && npm run build

# ✅ Sanity check - jeśli coś zawiera localhost:8080 to budujemy niepoprawnie
RUN ! grep -r "localhost:8080" .next || (echo "❌ localhost:8080 found in build output!" && exit 1)

# --- Dev stage (jeśli chcesz development pod Dockerem)
FROM node:20-alpine AS dev
WORKDIR /app
ENV NODE_ENV=development
ENV NEXT_PUBLIC_KEYCLOAK_URL=http://auth.localhost
COPY --from=builder /app /app
EXPOSE 3000
CMD ["npm", "run", "dev"]

# --- Final production image
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000 || exit 1

EXPOSE 3000
CMD ["npm", "start"]