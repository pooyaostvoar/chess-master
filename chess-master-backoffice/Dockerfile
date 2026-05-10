FROM node:20-alpine AS build

WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

COPY package.json ./
RUN pnpm install --no-frozen-lockfile

COPY . .
RUN pnpm build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
