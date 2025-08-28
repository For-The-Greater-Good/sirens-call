# Docker Configuration

## Overview

This repository contains two separate websites that run as independent Docker containers:
- **front-page**: Main pirate-themed website (www.for-the-gg.org)
- **docs-site**: Documentation site with Starlight (docs.for-the-gg.org)

## Production Setup

### Container Configuration

Both sites run nginx on port 80 internally. No ports are exposed externally - Cloudflare tunnels connect directly to the containers on the internal Docker network.

```bash
# Start full production stack (websites + tunnel)
docker compose up -d

# Start only the web containers (without tunnel, for local testing)
docker compose up front-page-prod docs-site-prod -d
```

### Cloudflare Tunnel Setup

1. Create a single tunnel in Cloudflare Zero Trust dashboard

2. Configure public hostnames for the tunnel:
   - `www.for-the-gg.org` → Service: `http://front-page-prod:80`
   - `docs.for-the-gg.org` → Service: `http://docs-site-prod:80`

3. Set the tunnel token in your environment:
```bash
export CLOUDFLARE_TUNNEL_TOKEN=your-tunnel-token
```

4. Start the stack:
```bash
docker compose up -d
```

## Development

For local development with hot reload:

```bash
# Start both development servers
docker compose --profile dev up

# Or run individually
docker compose up front-page-dev  # http://localhost:4321
docker compose up docs-site-dev   # http://localhost:4322
```

## Building Images

```bash
# Build both production images
docker compose build front-page-prod docs-site-prod

# Build individually
docker compose build front-page-prod
docker compose build docs-site-prod
```

## Network Architecture

```
Internet → Cloudflare → Tunnel → Docker Internal Network → Container:80
```

- Containers run on internal Docker network
- No ports exposed to host
- Cloudflare tunnels handle TLS termination and DDoS protection
- Each site is completely independent

## Directory Structure

```
sirens-call/
├── .docker/
│   ├── Dockerfile        # Shared multi-stage Dockerfile
│   └── nginx.conf        # Shared nginx configuration
├── front-page/           # Main website (pirate theme)
│   ├── src/
│   ├── public/
│   └── package.json
├── docs-site/            # Documentation (Starlight)
│   ├── src/
│   ├── public/
│   └── package.json
└── docker-compose.yml    # Orchestration configuration
```

## Commands Reference

```bash
# Production (with tunnels)
docker compose up -d

# Production (local testing without tunnels)
docker compose up front-page-prod docs-site-prod -d

# Development
docker compose --profile dev up

# View logs
docker compose logs -f front-page-prod
docker compose logs -f docs-site-prod
docker compose logs -f cloudflared

# Stop everything
docker compose down
```