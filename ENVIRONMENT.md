# 🌍 Environment Variables

## 📋 Table of Contents

- [Overview](#overview)
- [Backend API Variables](#backend-api-variables)
- [Telegram Bot Variables](#telegram-bot-variables)
- [Docker Compose Variables](#docker-compose-variables)
- [Security Best Practices](#security-best-practices)

## 🎯 Overview

Environment variables are used to configure the application without changing code.

### Files

- `.env` - Main environment file (root directory)
- `nodejs_space/.env` - Backend API specific
- `bot/.env` - Bot specific
- `.env.example` - Example template

**⚠️ IMPORTANT:** Never commit `.env` files to Git!

---

## 🔧 Backend API Variables

**Location:** `nodejs_space/.env`

### DATABASE_URL

**Required:** Yes  
**Type:** Connection string  
**Description:** PostgreSQL database connection string

**Format:**
```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
```

**Examples:**

```env
# Development (local PostgreSQL)
DATABASE_URL=postgresql://shopuser:shoppassword@localhost:5432/telegram_shop?schema=public

# Docker Compose
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/telegram_shop?schema=public

# Production (with SSL)
DATABASE_URL=postgresql://produser:strongpass@db.example.com:5432/telegram_shop?schema=public&sslmode=require
```

---

### PORT

**Required:** No  
**Type:** Number  
**Default:** 3000  
**Description:** Port on which API server listens

```env
PORT=3000
```

**Note:** In Docker, internal port is always 3000, external mapping is in `docker-compose.yml`

---

### JWT_SECRET

**Required:** Yes  
**Type:** String  
**Description:** Secret key for signing JWT tokens

**⚠️ CRITICAL:** Must be changed in production!

**Requirements:**
- Minimum 32 characters
- Random string
- Include letters, numbers, symbols

**Generate secure secret:**

```bash
# Using OpenSSL
openssl rand -base64 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Example:**
```env
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

---

### JWT_EXPIRES_IN

**Required:** No  
**Type:** String (time format)  
**Default:** 30m  
**Description:** JWT token expiration time

**Formats:**
- `30m` - 30 minutes
- `1h` - 1 hour
- `24h` - 24 hours
- `7d` - 7 days

```env
JWT_EXPIRES_IN=30m
```

**Recommendations:**
- Development: `24h`
- Production: `30m` to `1h`

---

### NODE_ENV

**Required:** No  
**Type:** String  
**Default:** development  
**Description:** Application environment

**Valid values:**
- `development` - Dev mode, verbose logs
- `production` - Production mode, optimized
- `test` - Testing mode

```env
NODE_ENV=production
```

**Impact:**
- Affects logging verbosity
- Enables/disables debug features
- Changes error messages (detailed vs generic)

---

### CORS_ORIGIN

**Required:** No  
**Type:** String (comma-separated)  
**Default:** *  
**Description:** Allowed CORS origins

```env
# Allow all (development only!)
CORS_ORIGIN=*

# Single domain
CORS_ORIGIN=https://yourdomain.com

# Multiple domains
CORS_ORIGIN=https://yourdomain.com,https://admin.yourdomain.com,http://localhost:3001
```

---

### GA4_MEASUREMENT_ID

**Required:** No  
**Type:** String  
**Description:** Google Analytics 4 Measurement ID

```env
GA4_MEASUREMENT_ID=G-XXXXXXXXXX
```

**To get:**
1. Go to Google Analytics
2. Admin → Data Streams
3. Copy Measurement ID

---

### YANDEX_METRIKA_ID

**Required:** No  
**Type:** Number  
**Description:** Yandex.Metrika counter ID

```env
YANDEX_METRIKA_ID=12345678
```

---

## 🤖 Telegram Bot Variables

**Location:** `bot/.env`

### BOT_TOKEN

**Required:** Yes  
**Type:** String  
**Description:** Telegram Bot API token from @BotFather

**Format:** `<bot_id>:<hash>`

```env
BOT_TOKEN=1234567890:ABCdefGhIjKlmNoPqRsTuVwXyZ
```

**To get:**
1. Open Telegram
2. Find [@BotFather](https://t.me/botfather)
3. Send `/newbot`
4. Follow instructions
5. Copy token

---

### API_BASE_URL

**Required:** Yes  
**Type:** URL  
**Description:** Base URL of Backend API

```env
# Development (local)
API_BASE_URL=http://localhost:3000/api

# Docker Compose (service name)
API_BASE_URL=http://api:3000/api

# Production
API_BASE_URL=https://api.yourdomain.com/api
```

---

### API_TIMEOUT

**Required:** No  
**Type:** Number (milliseconds)  
**Default:** 10000  
**Description:** HTTP request timeout

```env
API_TIMEOUT=10000
```

---

### ADMIN_TELEGRAM_IDS

**Required:** Yes  
**Type:** String (comma-separated numbers)  
**Description:** Telegram IDs of administrators who receive notifications

```env
# Single admin
ADMIN_TELEGRAM_IDS=123456789

# Multiple admins
ADMIN_TELEGRAM_IDS=123456789,987654321,555444333
```

**To get your Telegram ID:**
1. Open Telegram
2. Find [@userinfobot](https://t.me/userinfobot)
3. Send `/start`
4. Copy your ID

---

### LOG_LEVEL

**Required:** No  
**Type:** String  
**Default:** info  
**Description:** Logging verbosity level

**Valid values (from least to most verbose):**
- `error` - Only errors
- `warn` - Warnings and errors
- `info` - General information
- `debug` - Debug information
- `verbose` - Everything

```env
# Development
LOG_LEVEL=debug

# Production
LOG_LEVEL=info
```

---

## 🐳 Docker Compose Variables

**Location:** `.env` (root directory)

Used by `docker-compose.yml`.

### Complete Example

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/telegram_shop?schema=public

# Backend API
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-in-production-minimum-32-characters
JWT_EXPIRES_IN=30m
NODE_ENV=production
CORS_ORIGIN=*

# Telegram Bot
BOT_TOKEN=1234567890:ABCdefGhIjKlmNoPqRsTuVwXyZ
ADMIN_TELEGRAM_IDS=123456789,987654321
API_BASE_URL=http://api:3000/api
API_TIMEOUT=10000
LOG_LEVEL=info

# Optional: Analytics
GA4_MEASUREMENT_ID=G-XXXXXXXXXX
YANDEX_METRIKA_ID=12345678
```

---

## 🔐 Security Best Practices

### 1. Never Commit Secrets

Add to `.gitignore`:
```
.env
.env.*
!.env.example
```

### 2. Use Strong Secrets

**Bad:**
```env
JWT_SECRET=secret123
```

**Good:**
```env
JWT_SECRET=8f7e6d5c4b3a2918273645aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpP
```

### 3. Different Secrets Per Environment

```env
# Development
JWT_SECRET=dev-secret-not-for-production

# Production
JWT_SECRET=prod-8f7e6d5c4b3a2918273645aAbBcCdD
```

### 4. Rotate Secrets Regularly

Change sensitive secrets periodically (every 3-6 months):
- JWT_SECRET
- Database passwords
- API keys

### 5. Limit Access

Only authorized personnel should have access to production `.env` files.

### 6. Use Environment-Specific Files

```
.env              # Default/development
.env.production   # Production
.env.staging      # Staging
.env.test         # Testing
```

### 7. Validate on Startup

Application should validate required environment variables on startup:

```typescript
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters');
}
```

### 8. Document All Variables

Keep `.env.example` updated with all required variables (without real values):

```env
# .env.example
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
JWT_SECRET=your-secret-here-min-32-chars
BOT_TOKEN=your-telegram-bot-token
```

---

## 🔧 Loading Environment Variables

### Backend API (NestJS)

```typescript
import { ConfigService } from '@nestjs/config';

constructor(private configService: ConfigService) {}

const port = this.configService.get<number>('PORT', 3000);
const jwtSecret = this.configService.get<string>('JWT_SECRET');
```

### Telegram Bot

```typescript
import dotenv from 'dotenv';
dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN!;
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';
```

---

## 📚 Additional Resources

- [SETUP.md](./SETUP.md) - Installation guide
- [DOCKER.md](./DOCKER.md) - Docker configuration
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues

---

**Updated:** 2025-12-04  
**Version:** 1.0.0
