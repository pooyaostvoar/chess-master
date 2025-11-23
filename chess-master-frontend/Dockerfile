# -----------------------------
# Stage 1: Build React App
# -----------------------------
FROM node:20 AS builder

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package files first (for caching)
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# Copy the rest of the source code
COPY . .

# Build React app
RUN pnpm build  # outputs 'build' folder

# -----------------------------
# Stage 2: Nginx to serve React
# -----------------------------
FROM nginx:alpine

# Copy built files from builder
COPY --from=builder /app/build /usr/share/nginx/html

# Optional: Copy custom nginx config if you have one
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 3000

# Run nginx
CMD ["nginx", "-g", "daemon off;"]
