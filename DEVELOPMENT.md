# 🛠️ Development Guide

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Adding Features](#adding-features)
- [Testing](#testing)
- [Code Style](#code-style)
- [Debugging](#debugging)
- [Contributing](#contributing)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ LTS
- Yarn 4+
- PostgreSQL 15+
- Git
- Code editor (VSCode recommended)

### Setup Development Environment

```bash
# Clone/extract project
cd telegram_shop_backend

# Install backend dependencies
cd nodejs_space
yarn install

# Install bot dependencies
cd ../bot
yarn install

# Setup database
cd ../nodejs_space
yarn prisma db push
yarn prisma db seed
```

---

## 📁 Project Structure

### Backend API (`nodejs_space/`)

```
nodejs_space/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Seed data
├── src/
│   ├── main.ts                # Entry point
│   ├── app.module.ts          # Root module
│   │
│   ├── auth/                  # Authentication
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts
│   │   ├── auth.controller.ts
│   │   ├── guards/            # JWT, Roles guards
│   │   ├── strategies/        # Passport strategies
│   │   └── dto/               # Data Transfer Objects
│   │
│   ├── products/              # Products module
│   │   ├── products.module.ts
│   │   ├── products.service.ts
│   │   ├── products.controller.ts
│   │   └── dto/
│   │
│   ├── orders/                # Orders module
│   ├── users/                 # Users module
│   ├── import-export/         # Import/Export module
│   ├── integrations/          # External integrations
│   ├── webhook/               # Telegram webhook
│   │
│   ├── prisma/                # Prisma service
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   │
│   └── common/                # Shared components
│       ├── decorators/        # Custom decorators
│       ├── filters/           # Exception filters
│       └── interceptors/      # Interceptors
│
├── test/                      # E2E tests
├── package.json
└── tsconfig.json
```

### Telegram Bot (`bot/`)

```
bot/
├── src/
│   ├── index.ts               # Entry point
│   ├── config/                # Configuration
│   │   └── index.ts
│   │
│   ├── handlers/              # Command handlers
│   │   ├── start.ts           # /start command
│   │   ├── catalog.ts         # Catalog browsing
│   │   ├── order.ts           # Order history
│   │   └── profile.ts         # User profile
│   │
│   ├── conversations/         # Dialog flows
│   │   └── order.ts           # Order conversation
│   │
│   ├── middleware/            # Bot middleware
│   │   ├── user.ts            # User management
│   │   ├── logging.ts         # Logging
│   │   └── error-handler.ts  # Error handling
│   │
│   ├── services/              # Services
│   │   ├── api-client.ts      # API wrapper
│   │   └── notification.ts    # Notifications
│   │
│   ├── utils/                 # Utilities
│   │   ├── logger.ts          # Winston logger
│   │   └── formatters.ts      # Formatters
│   │
│   └── types/                 # TypeScript types
│       └── index.ts
│
├── package.json
└── tsconfig.json
```

---

## 💻 Development Workflow

### Starting Development Servers

#### Terminal 1: Database
```bash
# Start PostgreSQL (if not using Docker)
pg_ctl start

# Or use Docker
docker run --name dev-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:15-alpine
```

#### Terminal 2: Backend API
```bash
cd nodejs_space

# Development mode with watch
yarn start:dev

# Or production mode
yarn build
yarn start:prod
```

API will be available at: http://localhost:3000

#### Terminal 3: Telegram Bot
```bash
cd bot

# Development mode with watch
yarn dev

# Or production mode
yarn build
yarn start
```

### Making Changes

1. **Create feature branch**
```bash
git checkout -b feature/my-feature
```

2. **Make changes**
3. **Test locally**
4. **Commit**
```bash
git add .
git commit -m "Add: My feature description"
```

5. **Push**
```bash
git push origin feature/my-feature
```

---

## ➕ Adding Features

### Adding a New API Endpoint

#### 1. Create DTO

```typescript
// src/products/dto/my-dto.ts
import { IsString, IsNumber } from 'class-validator';

export class MyDto {
  @IsString()
  name: string;

  @IsNumber()
  price: number;
}
```

#### 2. Add Service Method

```typescript
// src/products/products.service.ts
async myNewMethod(data: MyDto): Promise<Product> {
  return this.prisma.products.create({
    data: {
      name: data.name,
      price: data.price,
      // ...
    },
  });
}
```

#### 3. Add Controller Endpoint

```typescript
// src/products/products.controller.ts
@Post('my-endpoint')
@ApiOperation({ summary: 'My new endpoint' })
async myEndpoint(@Body() data: MyDto): Promise<Product> {
  return this.productsService.myNewMethod(data);
}
```

#### 4. Test

```bash
curl -X POST http://localhost:3000/api/products/my-endpoint   -H "Content-Type: application/json"   -d '{"name":"Test","price":100}'
```

---

### Adding a New Bot Command

#### 1. Create Handler

```typescript
// bot/src/handlers/my-handler.ts
import { Bot } from 'grammy';
import type { BotContext } from '../types';

export function registerMyHandler(bot: Bot<BotContext>) {
  bot.command('mycommand', async (ctx) => {
    await ctx.reply('Hello from my command!');
  });

  bot.callbackQuery(/^my:/, async (ctx) => {
    await ctx.answerCallbackQuery();
    // Handle callback
  });
}
```

#### 2. Register Handler

```typescript
// bot/src/index.ts
import { registerMyHandler } from './handlers/my-handler';

// ... in main()
registerMyHandler(bot);
```

---

### Adding a Database Table

#### 1. Edit Prisma Schema

```prisma
// nodejs_space/prisma/schema.prisma
model my_table {
  id         Int      @id @default(autoincrement())
  name       String   @db.VarChar(255)
  created_at DateTime @default(now()) @db.Timestamptz()

  @@map("my_table")
}
```

#### 2. Apply Migration

```bash
cd nodejs_space
yarn prisma db push
yarn prisma generate
```

#### 3. Use in Service

```typescript
async getMyData(): Promise<MyTable[]> {
  return this.prisma.my_table.findMany();
}
```

---

## 🧪 Testing

### Unit Tests

```bash
cd nodejs_space

# Run all tests
yarn test

# Watch mode
yarn test:watch

# Coverage
yarn test:cov
```

### E2E Tests

```bash
cd nodejs_space

# Run E2E tests
yarn test:e2e
```

### Manual API Testing

**Using cURL:**
```bash
# Get products
curl http://localhost:3000/api/products

# Create product (with auth)
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/token   -H "Content-Type: application/json"   -d '{"username":"admin","password":"admin123"}'   | jq -r '.access_token')

curl -X POST http://localhost:3000/api/admin/products   -H "Authorization: Bearer $TOKEN"   -H "Content-Type: application/json"   -d '{"name":"Test Product","description":"Test","category_id":1}'
```

**Using Swagger UI:**
1. Open http://localhost:3000/api-docs
2. Click "Authorize" and enter JWT token
3. Test endpoints interactively

---

## 📝 Code Style

### TypeScript

Follow NestJS conventions and TypeScript best practices.

**Example:**
```typescript
// Good
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getProducts(query: ProductListQueryDto): Promise<ProductListResponseDto> {
    this.logger.log('Fetching products');
    
    const products = await this.prisma.products.findMany({
      where: { is_active: true },
      take: query.limit,
      skip: (query.page - 1) * query.limit,
    });

    return {
      data: products,
      meta: { page: query.page, limit: query.limit },
    };
  }
}
```

### Naming Conventions

**Files:**
- `kebab-case.ts` for files
- `my-feature.service.ts`
- `my-feature.controller.ts`
- `my-feature.module.ts`

**Classes:**
- `PascalCase` for classes
- `MyFeatureService`
- `MyFeatureController`

**Functions:**
- `camelCase` for functions
- `getProducts()`
- `createOrder()`

**Constants:**
- `UPPER_SNAKE_CASE` for constants
- `API_BASE_URL`
- `MAX_ITEMS_PER_PAGE`

### Linting

```bash
# Backend
cd nodejs_space
yarn lint

# Bot
cd bot
yarn lint
```

---

## 🐛 Debugging

### VSCode Debug Configuration

**`.vscode/launch.json`:**
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug API",
      "runtimeExecutable": "yarn",
      "runtimeArgs": ["start:debug"],
      "cwd": "${workspaceFolder}/nodejs_space",
      "restart": true,
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Bot",
      "runtimeExecutable": "yarn",
      "runtimeArgs": ["dev"],
      "cwd": "${workspaceFolder}/bot",
      "restart": true,
      "console": "integratedTerminal"
    }
  ]
}
```

### Logging

**Backend:**
```typescript
import { Logger } from '@nestjs/common';

const logger = new Logger('MyService');
logger.log('Info message');
logger.error('Error message', error.stack);
logger.warn('Warning message');
logger.debug('Debug message');
```

**Bot:**
```typescript
import { logger } from './utils/logger';

logger.info('Info message', { userId: 123 });
logger.error('Error message', error);
```

### Database Debugging

```bash
# Open Prisma Studio (GUI for database)
cd nodejs_space
yarn prisma studio

# Manual queries
yarn prisma db pull  # Update schema from DB
yarn prisma format   # Format schema file
```

---

## 🤝 Contributing

### Git Workflow

1. Fork/clone repository
2. Create feature branch: `git checkout -b feature/my-feature`
3. Make changes
4. Run tests: `yarn test`
5. Run linter: `yarn lint`
6. Commit: `git commit -m "Add: My feature"`
7. Push: `git push origin feature/my-feature`
8. Create Pull Request

### Commit Message Format

```
Type: Brief description

Detailed explanation if needed.

Closes #123
```

**Types:**
- `Add:` - New feature
- `Fix:` - Bug fix
- `Update:` - Update existing feature
- `Refactor:` - Code refactoring
- `Docs:` - Documentation
- `Test:` - Tests
- `Chore:` - Maintenance

**Examples:**
```
Add: Product filtering by price range

Implement price range filter in products endpoint.
Supports min_price and max_price query parameters.

Closes #45
```

```
Fix: Order total calculation error

Fixed decimal precision issue in order total calculation
that caused rounding errors.

Closes #67
```

---

## 🔧 Useful Commands

### Backend API

```bash
cd nodejs_space

# Development
yarn start:dev          # Start with watch mode
yarn start:debug        # Start with debug mode

# Production
yarn build              # Compile TypeScript
yarn start:prod         # Start compiled app

# Database
yarn prisma studio      # Open Prisma Studio
yarn prisma db push     # Apply schema changes
yarn prisma db seed     # Run seed script
yarn prisma generate    # Generate Prisma Client

# Testing
yarn test               # Run unit tests
yarn test:e2e           # Run E2E tests
yarn test:cov           # Run with coverage

# Quality
yarn lint               # Run ESLint
yarn format             # Run Prettier
```

### Telegram Bot

```bash
cd bot

# Development
yarn dev                # Start with watch mode

# Production
yarn build              # Compile TypeScript
yarn start              # Start compiled app

# Quality
yarn lint               # Run ESLint
```

---

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Grammy Documentation](https://grammy.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- [BOT_LOGIC.md](./BOT_LOGIC.md)
- [DATABASE.md](./DATABASE.md)

---

**Updated:** 2025-12-04  
**Version:** 1.0.0
