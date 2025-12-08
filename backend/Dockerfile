# backend/Dockerfile
FROM node:22.20-alpine

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier tout le code source
COPY . .

# Genere le client Prisma pour l'environnement du conteneur
RUN npx prisma generate

# Exposer le port utilisé par le backend
EXPOSE 3000

# Commande pour démarrer le backend
CMD ["npm", "run", "dev"]
