# -----------------------------
# Stage 1: Build React App
# -----------------------------
FROM node:20 AS builder

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm@10.22.0

# Copy package files first (for caching)
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# Copy the rest of the source code
COPY . .

# Set API URL for production
ENV REACT_APP_API_URL=https://chesswithmasters.com/api

# Build React app (outputs 'build' folder)
RUN pnpm build

# -----------------------------
# Stage 2: Nginx to serve React
# -----------------------------
FROM nginx:alpine

# Copy React build output
COPY --from=builder /app/build /usr/share/nginx/html

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
