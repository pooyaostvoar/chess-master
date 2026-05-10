FROM node:20 AS builder
WORKDIR /app
RUN npm install -g pnpm@9.0.0
COPY package.json pnpm-lock.yaml ./
RUN pnpm install
COPY . .
RUN pnpm exec tsc --project tsconfig.build.json

FROM node:20-slim
WORKDIR /app

# Copy build and node_modules from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json pnpm-lock.yaml ./

EXPOSE 3004
CMD ["node", "dist/app.js"]
