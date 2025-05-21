FROM node:20

# Ustaw katalog roboczy
WORKDIR /app

# Skopiuj zależności
COPY package*.json ./

# Zainstaluj zależności (w tym prisma i @prisma/client)
RUN npm install

# Skopiuj pliki źródłowe
COPY . .

# Wygeneruj klienta Prisma
RUN npx prisma generate

# Wystaw port
EXPOSE 3001

# Uruchom aplikację
CMD ["npm", "start"]