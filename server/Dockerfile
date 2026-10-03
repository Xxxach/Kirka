FROM node:22-alpine

ENV NODE_ENV=production
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .

USER node

# Yandex Serverless Containers сам задаёт PORT, index.js его читает.
CMD ["node", "index.js"]
