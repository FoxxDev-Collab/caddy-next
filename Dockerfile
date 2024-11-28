FROM node:20-alpine AS builder

# Install dependencies for building
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files
COPY package*.json ./

# First generate/update the package-lock.json
RUN npm install

# Then run ci for reproducible builds
RUN npm ci

# Copy source code and config files
COPY . .

# Build the application
RUN npm run build

# Production image
FROM node:20-alpine AS runner

# Install Caddy
RUN apk add --no-cache caddy

WORKDIR /app

# Create config directories
RUN mkdir -p config/hosts config/ssl

# Copy built application
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/config ./config

# Copy the entire .next directory to ensure all build outputs are included
COPY --from=builder /app/.next ./.next

# Copy package files including the lock file
COPY --from=builder /app/package*.json ./

# Copy config files needed for styling
COPY --from=builder /app/postcss.config.js ./
COPY --from=builder /app/tailwind.config.ts ./

# Copy entrypoint script
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Install all dependencies for production
RUN npm install
RUN npm ci

EXPOSE 3000
EXPOSE 80
EXPOSE 443
EXPOSE 2019

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_SHARP_PATH=/app/node_modules/sharp

ENTRYPOINT ["/app/docker-entrypoint.sh"]
