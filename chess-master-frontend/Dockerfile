# -----------------------------
# Stage 1: Build React App
# -----------------------------
FROM node:20 AS builder

WORKDIR /app

# System libraries required by the headless Chrome that puppeteer launches
# during the "postbuild" prerender step (scripts/prerender.js). Without these,
# prerendering fails with "Failed to launch the browser process".
RUN apt-get update && apt-get install -y --no-install-recommends \
    libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libxkbcommon0 \
    libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 libpango-1.0-0 \
    libcairo2 libasound2 libatspi2.0-0 libx11-xcb1 libxshmfence1 \
    fonts-liberation \
  && rm -rf /var/lib/apt/lists/*

# Install pnpm globally
RUN npm install -g pnpm@9.0.0

# Copy package files first (for caching)
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# Ensure puppeteer's Chrome is present for the prerender step. pnpm v9 can skip
# a dependency's postinstall (which is what downloads Chrome), so install it
# explicitly and idempotently here.
RUN pnpm exec puppeteer browsers install chrome

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
