FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3026

CMD ["node", "server.js"]
