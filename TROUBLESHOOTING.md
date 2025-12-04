# 🔧 Troubleshooting Guide

## 📋 Table of Contents

- [Common Issues](#common-issues)
- [Database Problems](#database-problems)
- [API Issues](#api-issues)
- [Bot Problems](#bot-problems)
- [Docker Issues](#docker-issues)
- [Performance Problems](#performance-problems)
- [Security Issues](#security-issues)

## 🐛 Common Issues

### Issue: Port Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**

```bash
# Find process using port 3000
lsof -i :3000
# or
netstat -tulpn | grep 3000

# Kill the process
kill -9 <PID>

# Or use different port in .env
PORT=3001
```

---

### Issue: Module Not Found

**Error:**
```
Error: Cannot find module '@nestjs/common'
```

**Solution:**

```bash
# Reinstall dependencies
cd nodejs_space
rm -rf node_modules
rm yarn.lock
yarn install
```

---

### Issue: Prisma Client Out of Sync

**Error:**
```
The `prisma generate` command was called to generate Prisma Client. 
However, your Prisma Client is already up to date!
```

**Solution:**

```bash
cd nodejs_space
yarn prisma generate --force
```

---

## 💾 Database Problems

### Issue: Cannot Connect to Database

**Error:**
```
Error: P1001: Can't reach database server at `localhost:5432`
```

**Solution:**

```bash
# Check PostgreSQL is running
pg_isready -h localhost -p 5432

# Or with Docker
docker ps | grep postgres

# Start PostgreSQL
# On macOS (Homebrew):
brew services start postgresql@15

# On Linux:
sudo systemctl start postgresql

# On Docker:
docker-compose up -d postgres
```

---

### Issue: Authentication Failed

**Error:**
```
Error: password authentication failed for user "postgres"
```

**Solution:**

Check DATABASE_URL in `.env`:
```env
DATABASE_URL=postgresql://correct_user:correct_password@localhost:5432/telegram_shop
```

Reset PostgreSQL password if needed:
```bash
sudo -u postgres psql
ALTER USER postgres PASSWORD 'new_password';
\q
```

---

### Issue: Database Does Not Exist

**Error:**
```
Error: P1003: Database `telegram_shop` does not exist
```

**Solution:**

```bash
# Create database
sudo -u postgres psql
CREATE DATABASE telegram_shop;
GRANT ALL PRIVILEGES ON DATABASE telegram_shop TO postgres;
\q

# Apply schema
cd nodejs_space
yarn prisma db push
```

---

### Issue: Migration Fails

**Error:**
```
Error: P3009: Failed to apply migration
```

**Solution:**

```bash
# Reset database (⚠️ DATA LOSS!)
cd nodejs_space
yarn prisma migrate reset

# Or manually fix schema
yarn prisma db pull
# Edit prisma/schema.prisma
yarn prisma db push
```

---

## 🔌 API Issues

### Issue: API Not Starting

**Error:**
```
Application failed to start
```

**Solution:**

```bash
# Check logs
cd nodejs_space
yarn start:dev

# Check for syntax errors
yarn build

# Verify environment variables
cat .env
```

---

### Issue: 401 Unauthorized

**Error:**
```
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**Solution:**

```bash
# Get fresh JWT token
curl -X POST http://localhost:3000/api/auth/token   -H "Content-Type: application/json"   -d '{"username":"admin","password":"admin123"}'

# Use token in requests
curl -H "Authorization: Bearer YOUR_TOKEN"   http://localhost:3000/api/admin/products
```

---

### Issue: 422 Validation Error

**Error:**
```json
{
  "statusCode": 422,
  "message": "Validation failed",
  "errors": [
    {
      "field": "name",
      "constraints": {
        "minLength": "name must be longer than or equal to 3 characters"
      }
    }
  ]
}
```

**Solution:**

Check request body matches DTO requirements:
```typescript
// ProductDto requires:
{
  "name": "Min 3 chars",
  "description": "Min 10 chars",
  "category_id": 1,  // Must exist
  "is_active": true
}
```

---

### Issue: CORS Error

**Error:**
```
Access to XMLHttpRequest has been blocked by CORS policy
```

**Solution:**

Add allowed origin to `.env`:
```env
CORS_ORIGIN=http://localhost:3001,https://yourdomain.com
```

Or allow all (development only):
```env
CORS_ORIGIN=*
```

---

## 🤖 Bot Problems

### Issue: Bot Not Responding

**Symptoms:** Bot doesn't reply to messages

**Solutions:**

1. **Check bot is running:**
```bash
# Check Docker
docker-compose logs bot

# Check PM2
pm2 logs telegram-shop-bot

# Check process
ps aux | grep "node.*bot"
```

2. **Verify BOT_TOKEN:**
```bash
# Check token format
echo $BOT_TOKEN
# Should be: 1234567890:ABCdefGhIjKlmNoPqRsTuVwXyZ

# Test token with Telegram API
curl https://api.telegram.org/bot$BOT_TOKEN/getMe
```

3. **Check API connection:**
```bash
# From bot container
docker-compose exec bot ping api

# Test API endpoint
curl http://api:3000/api/products
```

4. **Restart bot:**
```bash
docker-compose restart bot
# or
pm2 restart telegram-shop-bot
```

---

### Issue: Bot Crashes on Start

**Error:**
```
TypeError: Cannot read property 'id' of undefined
```

**Solution:**

```bash
# Check bot logs
docker-compose logs bot

# Common causes:
# 1. Invalid BOT_TOKEN
# 2. API not accessible
# 3. Missing environment variables

# Verify .env
cd bot
cat .env

# Should have:
# BOT_TOKEN=...
# API_BASE_URL=http://api:3000/api
# ADMIN_TELEGRAM_IDS=...
```

---

### Issue: Conversation State Lost

**Symptoms:** Bot forgets conversation mid-flow

**Solution:**

Bot uses in-memory sessions by default. They reset on restart.

For persistent sessions, implement session storage:
```typescript
// bot/src/index.ts
import { session } from 'grammy';

bot.use(session({
  storage: /* use file/redis storage */,
  initial(): SessionData {
    return { /* initial state */ };
  },
}));
```

---

### Issue: Admin Not Receiving Notifications

**Symptoms:** Orders created but admin not notified

**Solution:**

```bash
# Check ADMIN_TELEGRAM_IDS
docker-compose exec bot env | grep ADMIN_TELEGRAM_IDS

# Should contain your Telegram ID
# Get your ID: https://t.me/userinfobot

# Update .env
ADMIN_TELEGRAM_IDS=123456789,987654321

# Restart bot
docker-compose restart bot
```

---

## 🐳 Docker Issues

### Issue: Container Exits Immediately

**Solution:**

```bash
# Check logs for exit reason
docker-compose logs api

# Common causes:
# 1. Syntax error in code
# 2. Missing environment variable
# 3. Database not ready

# Try starting with verbose logs
docker-compose up api
```

---

### Issue: Database Container Unhealthy

**Error:**
```
postgres unhealthy
```

**Solution:**

```bash
# Check health
docker-compose exec postgres pg_isready -U postgres

# Check logs
docker-compose logs postgres

# Remove and recreate
docker-compose down postgres
docker-compose up -d postgres

# Wait for healthy status
watch docker-compose ps
```

---

### Issue: Volume Permission Denied

**Error:**
```
Error: EACCES: permission denied
```

**Solution:**

```bash
# Fix permissions
docker-compose down
sudo chown -R $USER:$USER .
docker-compose up -d
```

---

### Issue: Network Error Between Containers

**Error:**
```
getaddrinfo ENOTFOUND api
```

**Solution:**

```bash
# Check network
docker network ls
docker network inspect telegram_shop_backend_default

# Recreate network
docker-compose down
docker-compose up -d
```

---

## ⚡ Performance Problems

### Issue: Slow API Responses

**Solution:**

1. **Add database indexes:**
```prisma
model products {
  // ...
  @@index([name])
  @@index([category_id, is_active])
}
```

2. **Enable query logging:**
```typescript
// Log slow queries
const prisma = new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
  ],
});

prisma.$on('query', (e) => {
  if (e.duration > 1000) {
    console.log('Slow query:', e.query, `${e.duration}ms`);
  }
});
```

3. **Check database stats:**
```bash
docker-compose exec postgres psql -U postgres -d telegram_shop -c "
  SELECT query, calls, total_time, mean_time
  FROM pg_stat_statements
  ORDER BY mean_time DESC
  LIMIT 10;
"
```

---

### Issue: High Memory Usage

**Solution:**

```bash
# Check usage
docker stats

# Limit memory in docker-compose.yml
services:
  api:
    deploy:
      resources:
        limits:
          memory: 512M

# Optimize Node.js
NODE_OPTIONS="--max-old-space-size=512" node dist/main.js
```

---

## 🔒 Security Issues

### Issue: JWT Token Expired

**Error:**
```json
{
  "statusCode": 401,
  "message": "Token expired"
}
```

**Solution:**

Get new token:
```bash
curl -X POST http://localhost:3000/api/auth/token   -H "Content-Type: application/json"   -d '{"username":"admin","password":"admin123"}'
```

Increase expiration in `.env`:
```env
JWT_EXPIRES_IN=1h  # Instead of 30m
```

---

### Issue: SQL Injection Attempt

Prisma automatically protects against SQL injection via parameterized queries.

**Safe (using Prisma):**
```typescript
await prisma.products.findMany({
  where: { name: { contains: userInput } }
});
```

**Unsafe (raw SQL):**
```typescript
// ⚠️ DON'T DO THIS
await prisma.$queryRaw`SELECT * FROM products WHERE name LIKE '%${userInput}%'`;
```

---

## 📞 Getting Help

### Check Logs

```bash
# Backend API
docker-compose logs -f api
# or
pm2 logs telegram-shop-api

# Telegram Bot
docker-compose logs -f bot
# or
pm2 logs telegram-shop-bot

# Database
docker-compose logs postgres
```

### Enable Debug Mode

```env
# API
NODE_ENV=development
LOG_LEVEL=debug

# Bot
LOG_LEVEL=debug
```

### Health Checks

```bash
# API health
curl http://localhost:3000/api

# Database health
docker-compose exec postgres pg_isready

# Bot (check logs)
docker-compose logs --tail=10 bot
```

---

## 📚 Additional Resources

- [SETUP.md](./SETUP.md) - Installation guide
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - API reference
- [BOT_LOGIC.md](./BOT_LOGIC.md) - Bot behavior
- [DOCKER.md](./DOCKER.md) - Docker guide
- [DATABASE.md](./DATABASE.md) - Database schema

---

**Updated:** 2025-12-04  
**Version:** 1.0.0
