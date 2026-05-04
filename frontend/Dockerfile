FROM node:20-alpine

WORKDIR /app

# Copiar el package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el código fuente
COPY . .

# Exponer el puerto por defecto de Vite
EXPOSE 5173

# Comando para arrancar Vite en modo desarrollo, expuesto para Docker
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
