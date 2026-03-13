FROM node:22-alpine AS base
WORKDIR /app

RUN npm install -g @nestjs/cli

COPY package*.json ./
RUN npm install

COPY . .

FROM base AS development
RUN npx prisma generate
RUN npm install prom-client
EXPOSE 3000
CMD ["npm", "run", "start:dev"]

FROM base AS build
RUN npx prisma generate
RUN npm run build
RUN npm prune --production

FROM node:22-alpine AS production
WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./
COPY --from=build /app/prisma ./prisma

EXPOSE 3000
CMD ["node", "dist/main.js"]
