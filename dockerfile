# Usa la imagen oficial de Node.js 22
FROM node:22

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copia el archivo package.json y package-lock.json
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto de los archivos de la aplicación
COPY . .

# Ejecuta prisma generate para asegurarse de que los binarios correctos estén presentes
RUN npx prisma generate

# Expone el puerto en el que la aplicación escuchará
EXPOSE 4000

# Comando para ejecutar la aplicación
CMD ["npm", "run", "dev"]