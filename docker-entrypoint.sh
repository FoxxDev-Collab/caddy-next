#!/bin/sh
set -e

# Create necessary directories
mkdir -p /app/config/hosts /app/config/ssl

# Always ensure correct Caddyfile content
echo "{
    admin 0.0.0.0:2019
    auto_https off
    persist_config off
    log {
        format json
        level INFO
    }
}

# Import all host configurations
import /app/config/hosts/*.conf" > /app/config/Caddyfile

# Start Caddy in the background
caddy run --config /app/config/Caddyfile &

# Wait for Caddy's admin API to be available
echo "Waiting for Caddy admin API to be available..."
timeout=30
while [ $timeout -gt 0 ]; do
    if wget --spider -q http://0.0.0.0:2019/config/; then
        echo "Caddy admin API is available"
        break
    fi
    timeout=$((timeout - 1))
    sleep 1
done

if [ $timeout -eq 0 ]; then
    echo "Timeout waiting for Caddy admin API"
    exit 1
fi

# Start Next.js
exec node server.js
