FROM node:18-alpine
WORKDIR /backend/app
COPY package*.json ./
COPY . .
RUN npm install
EXPOSE 3001
CMD ["node","server.js"]


