# Caddy Next

A modern web interface for managing Caddy reverse proxies.

## Features

- Manage Caddy reverse proxy configurations through a user-friendly interface
- Automatic HTTPS with Let's Encrypt
- Real-time configuration updates
- Host management with SSL options
- Containerized deployment with Docker

## Prerequisites

- Docker
- Docker Compose

## Getting Started

1. Clone the repository:
```bash
git clone <repository-url>
cd caddy-next
```

2. Create a `.env` file with the required environment variables:
```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key  # Change this in production
```

3. Build and start the application:
```bash
docker compose up -d --build
```

The application will be available at:
- Web Interface: http://localhost:3000
- Caddy Admin API: http://localhost:2019

## Configuration

### Directory Structure

```
caddy-next/
├── config/
│   ├── hosts/    # Host configurations
│   ├── ssl/      # SSL certificates
│   └── Caddyfile # Base Caddy configuration
├── src/          # Application source code
└── docker-compose.yml
```

### Volumes

The application uses Docker volumes to persist data:
- `caddy_data`: Stores Caddy data including certificates
- `caddy_config`: Stores Caddy configuration
- `./config`: Mounted from the host for easy access to configurations

## Development

To run the application in development mode:

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

## Production Deployment

For production deployment:

1. Update environment variables in docker-compose.yml
2. Ensure proper domain configuration
3. Deploy using Docker Compose:
```bash
docker compose up -d
```

## Security Considerations

- Change the `NEXTAUTH_SECRET` in production
- Secure the Caddy admin API endpoint
- Use proper SSL certificates in production
- Follow security best practices for reverse proxy configurations

## License

[Your License]
