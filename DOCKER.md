# 🐳 Docker Documentation

## 📋 Table of Contents

- [Overview](#overview)
- [Docker Architecture](#docker-architecture)
- [Services](#services)
- [docker-compose.yml](#docker-composeyml)
- [Volumes](#volumes)
- [Networks](#networks)
- [Common Commands](#common-commands)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

The project uses **Docker Compose** for containerization and orchestration.

### Benefits

- ✅ Consistent environment across all systems
- ✅ Easy deployment
- ✅ Isolated services
- ✅ Automatic dependency management
- ✅ Health checks
- ✅ Easy scaling

---

## 🏗️ Docker Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Docker Compose                      │
└───────────────────┬─────────────────────────────────┘
                    │
     ┌──────────────┼──────────────┐
     │              │              │
┌────▼────┐   ┌─────▼────┐   ┌────▼────┐
│postgres │   │   api    │   │   bot   │
│ (DB)    │   │(Backend) │   │(Telegram)│
│         │   │          │   │         │
│ Port:   │◄──┤ Port:    │◄──┤ No port │
│ 5432    │   │ 3000     │   │ exposed │
└────┬────┘   └────┬─────┘   └────┬────┘
     │             │              │
     │             │              │
     └─────────────┴──────────────┘
              Network: default

     ┌─────────────┬──────────────┐
     │             │              │
┌────▼──────┐ ┌───▼────────┐ ┌──▼─────┐
│postgres   │ │ no volume  │ │ bot    │
│ _data     │ │            │ │ _logs  │
│ (persist) │ │            │ │        │
└───────────┘ └────────────┘ └────────┘
```

---

## 🔧 Services

### 1. postgres

PostgreSQL database service.

**Image:** `postgres:15-alpine`  
**Container Name:** `telegram_shop_db`  
**Restart Policy:** `unless-stopped`

**Environment:**
- `POSTGRES_USER=postgres`
- `POSTGRES_PASSWORD=postgres`
- `POSTGRES_DB=telegram_shop`

**Ports:**
- `5432:5432` (host:container)

**Volume:**
- `postgres_data:/var/lib/postgresql/data`

**Health Check:**
```yaml
test: ['CMD-SHELL', 'pg_isready -U postgres']
interval: 10s
timeout: 5s
retries: 5
```

---

### 2. api

Backend API service (NestJS).

**Build Context:** `.`  
**Dockerfile:** `./Dockerfile`  
**Container Name:** `telegram_shop_api`  
**Restart Policy:** `unless-stopped`

**Environment:**
- `NODE_ENV=production`
- `DATABASE_URL` (from .env)
- `PORT=3000`
- `JWT_SECRET` (from .env)
- `JWT_EXPIRES_IN=30m`

**Ports:**
- `3000:3000`

**Depends On:**
- `postgres` (waits for healthy status)

**Command:**
```bash
sh -c "yarn prisma db push && yarn prisma:seed && node dist/main.js"
```

**What happens on start:**
1. Waits for PostgreSQL to be healthy
2. Applies database schema (`prisma db push`)
3. Seeds initial data (`prisma:seed`)
4. Starts NestJS application

---

### 3. bot

Telegram bot service (Grammy).

**Build Context:** `./bot`  
**Dockerfile:** `./bot/Dockerfile`  
**Container Name:** `telegram_shop_bot`  
**Restart Policy:** `unless-stopped`

**Environment:**
- `NODE_ENV=production`
- `BOT_TOKEN` (from .env)
- `API_BASE_URL=http://api:3000/api`
- `API_TIMEOUT=10000`
- `ADMIN_TELEGRAM_IDS` (from .env)
- `LOG_LEVEL=info`

**Depends On:**
- `api`

**Volume:**
- `bot_logs:/app/logs`

---

## 📄 docker-compose.yml

**Location:** `./docker-compose.yml`

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: telegram_shop_db
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: telegram_shop
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U postgres']
      interval: 10s
      timeout: 5s
      retries: 5

  api:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: telegram_shop_api
    restart: unless-stopped
    ports:
      - '3000:3000'
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/telegram_shop?schema=public
      PORT: 3000
      JWT_SECRET: ${JWT_SECRET:-your-secret-key-change-in-production}
      JWT_EXPIRES_IN: 30m
    depends_on:
      postgres:
        condition: service_healthy
    command: sh -c "yarn prisma db push && yarn prisma:seed && node dist/main.js"

  bot:
    build:
      context: ./bot
      dockerfile: Dockerfile
    container_name: telegram_shop_bot
    restart: unless-stopped
    environment:
      NODE_ENV: production
      BOT_TOKEN: ${BOT_TOKEN}
      API_BASE_URL: http://api:3000/api
      API_TIMEOUT: 10000
      ADMIN_TELEGRAM_IDS: ${ADMIN_TELEGRAM_IDS}
      LOG_LEVEL: info
    depends_on:
      - api
    volumes:
      - bot_logs:/app/logs

volumes:
  postgres_data:
  bot_logs:
```

---

## 💾 Volumes

### postgres_data

**Type:** Named volume  
**Purpose:** Persist PostgreSQL data  
**Location:** `/var/lib/postgresql/data` (inside container)

**Why persistent:**
- Database survives container restarts
- Data not lost on `docker-compose down`

**To delete:**
```bash
docker-compose down -v
```

---

### bot_logs

**Type:** Named volume  
**Purpose:** Persist bot logs  
**Location:** `/app/logs` (inside container)

**Access logs:**
```bash
# From host
docker-compose exec bot ls -lh /app/logs

# Copy to host
docker cp telegram_shop_bot:/app/logs ./bot_logs_backup
```

---

## 🌐 Networks

### default

Docker Compose automatically creates a default network.

**Services can communicate using service names:**

```typescript
// Bot can reach API using service name
const API_BASE_URL = 'http://api:3000/api';

// API can reach PostgreSQL using service name
DATABASE_URL = 'postgresql://postgres:postgres@postgres:5432/telegram_shop';
```

**DNS Resolution:**
- `postgres` → `172.18.0.2` (example)
- `api` → `172.18.0.3`
- `bot` → `172.18.0.4`

---

## 🎮 Common Commands

### Start Services

```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d api

# Start with build
docker-compose up -d --build

# View startup logs
docker-compose up
```

---

### Stop Services

```bash
# Stop all services
docker-compose stop

# Stop specific service
docker-compose stop bot

# Stop and remove containers
docker-compose down

# Stop and remove containers + volumes (⚠️ data loss!)
docker-compose down -v
```

---

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f bot
docker-compose logs -f postgres

# Last N lines
docker-compose logs --tail=100 api

# Since timestamp
docker-compose logs --since="2025-12-04T10:00:00"
```

---

### Service Status

```bash
# List running services
docker-compose ps

# Detailed info
docker-compose ps -a

# Resource usage
docker stats

# Service health
docker-compose ps | grep healthy
```

---

### Restart Services

```bash
# Restart all
docker-compose restart

# Restart specific
docker-compose restart api
docker-compose restart bot
```

---

### Execute Commands in Containers

```bash
# Open shell in API container
docker-compose exec api sh

# Run Prisma migrations
docker-compose exec api npx prisma db push

# Check database
docker-compose exec postgres psql -U postgres -d telegram_shop

# View logs inside bot container
docker-compose exec bot ls -lh /app/logs
```

---

### Rebuild Services

```bash
# Rebuild all images
docker-compose build

# Rebuild specific service
docker-compose build api

# Rebuild without cache
docker-compose build --no-cache

# Rebuild and start
docker-compose up -d --build
```

---

### Clean Up

```bash
# Remove stopped containers
docker-compose rm

# Remove all project containers, networks, images
docker-compose down --rmi all

# Remove everything including volumes (⚠️ DATA LOSS!)
docker-compose down -v --rmi all

# Clean up dangling images
docker image prune

# Full system cleanup
docker system prune -a --volumes
```

---

## 🔍 Inspecting Services

### View Container Details

```bash
# Container info
docker inspect telegram_shop_api

# Network info
docker network inspect telegram_shop_backend_default

# Volume info
docker volume inspect telegram_shop_backend_postgres_data
```

---

### Resource Monitoring

```bash
# Real-time stats
docker stats

# Specific containers
docker stats telegram_shop_api telegram_shop_bot

# Disk usage
docker system df
```

---

## 🐛 Troubleshooting

### Service Won't Start

```bash
# Check logs for errors
docker-compose logs api

# Check last 50 lines
docker-compose logs --tail=50 api

# Remove and rebuild
docker-compose down
docker-compose up -d --build
```

---

### Database Connection Issues

```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Check PostgreSQL health
docker-compose exec postgres pg_isready -U postgres

# Check connection from API container
docker-compose exec api ping postgres

# Manual database connection
docker-compose exec postgres psql -U postgres -d telegram_shop -c "SELECT 1;"
```

---

### Port Conflicts

```
Error: port is already allocated
```

**Solution:**

```bash
# Find process using port 3000
lsof -i :3000
# or
netstat -tulpn | grep 3000

# Kill process
kill -9 <PID>

# Or change port in docker-compose.yml
ports:
  - '3001:3000'  # Map to different host port
```

---

### Permission Issues

```bash
# Fix volume permissions
docker-compose down
sudo chown -R $USER:$USER postgres_data/
docker-compose up -d
```

---

### Out of Disk Space

```bash
# Check disk usage
docker system df

# Clean up
docker system prune -a --volumes

# Remove specific volume
docker volume rm telegram_shop_backend_postgres_data
```

---

### Bot Not Receiving Messages

```bash
# Check bot logs
docker-compose logs -f bot

# Check API is accessible from bot
docker-compose exec bot wget -O- http://api:3000/api/products

# Check BOT_TOKEN is correct
docker-compose exec bot env | grep BOT_TOKEN

# Restart bot
docker-compose restart bot
```

---

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [SETUP.md](./SETUP.md)
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

---

**Updated:** 2025-12-04  
**Version:** 1.0.0
