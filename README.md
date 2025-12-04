# Telegram Store MVP - Backend API

A comprehensive NestJS backend API for a Telegram-based e-commerce store, featuring product management, order processing, and extensive integrations.

## 🚀 Features

### Core Functionality
- **Product Management**: Full CRUD operations with support for product variants (color, size, etc.)
- **Order Processing**: Create, track, and manage orders with real-time status updates
- **User Management**: Customer profiles and order history tracking
- **Admin Panel**: Role-based access control (admin, manager) with audit logging

### Integrations
- **Import/Export**: CSV, XLSX, and Google Sheets support for bulk operations
- **Analytics**: Google Analytics (GA4) and Yandex Metrika event tracking
- **Telegram Bot**: Webhook endpoint for bot integration

### Security
- JWT-based authentication with Passport.js
- Role-based authorization guards
- Rate limiting (Throttler)
- Input validation with class-validator
- SQL injection protection (Prisma ORM)

## 📋 Tech Stack

- **Framework**: NestJS 11.x (TypeScript)
- **Database**: PostgreSQL 15+ with Prisma ORM
- **Authentication**: JWT with Passport.js
- **Validation**: class-validator, class-transformer
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest
- **Deployment**: Docker, docker-compose

## 🛠️ Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Yarn package manager

## ⚡ Quick Start

### 1. Install Dependencies

```bash
cd nodejs_space
yarn install
```

### 2. Environment Setup

Copy the example environment file:

```bash
cp .env.example .env
```

Update `.env` with your configuration:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/telegram_shop"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="30m"
PORT=3000
```

### 3. Database Setup

```bash
# Generate Prisma Client
yarn prisma generate

# Push schema to database
yarn prisma db push

# Seed initial data (admin user, categories, sample products)
yarn prisma db seed
```

### 4. Run the Application

**Development mode (with hot reload):**
```bash
yarn start:dev
```

**Production mode:**
```bash
yarn build
yarn start:prod
```

The API will be available at: `http://localhost:3000`

## 📖 API Documentation

Swagger UI is available at: **http://localhost:3000/api-docs**

### Default Admin Credentials

```
Username: admin
Password: admin123
```

**⚠️ Change these credentials in production!**

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down
```

### Manual Docker Build

```bash
# Build image
docker build -t telegram-shop-api .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="your-secret" \
  telegram-shop-api
```

## 📦 API Endpoints Overview

### Authentication
- `POST /api/auth/token` - Admin login (get JWT token)

### Public Endpoints
- `GET /api/products` - List products (paginated, filterable)
- `GET /api/products/:id` - Get product details with variants
- `GET /api/categories` - List all categories
- `POST /api/orders` - Create new order

### Admin Endpoints (Require JWT)

#### Products
- `GET /api/admin/products` - List all products (including inactive)
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product

#### Orders
- `GET /api/admin/orders` - List all orders (filterable by status)
- `GET /api/admin/orders/:id` - Get order details
- `PATCH /api/admin/orders/:id` - Update order status

#### Users
- `GET /api/admin/users` - List customers
- `GET /api/admin/users/:id` - Get customer details and order history

#### Import/Export
- `POST /api/admin/import/csv` - Import products from CSV
- `POST /api/admin/import/xlsx` - Import products from XLSX
- `POST /api/admin/import/google-sheets` - Import from Google Sheets
- `GET /api/admin/export/csv` - Export orders to CSV
- `GET /api/admin/export/xlsx` - Export orders to XLSX
- `POST /api/admin/export/google-sheets` - Export orders to Google Sheets

### Webhook
- `POST /api/webhook/telegram` - Telegram Bot webhook endpoint

## 🧪 Testing

```bash
# Unit tests
yarn test

# E2E tests
yarn test:e2e

# Test coverage
yarn test:cov
```

## 📊 Database Schema

### Main Tables
- **users**: Telegram customers
- **admin_users**: Admin panel users with roles
- **categories**: Product categories (hierarchical)
- **products**: Base products
- **product_variants**: Purchasable variants with SKU, price, stock
- **option_types**: Variant option types (Color, Size, etc.)
- **option_values**: Specific values for options (Red, Blue, M, L, etc.)
- **variant_values**: Links variants to their option values
- **orders**: Customer orders
- **order_items**: Line items in orders
- **audit_logs**: Admin action tracking

## 🔐 Security Best Practices

1. **Change default credentials** immediately after first deployment
2. **Use strong JWT secrets** (minimum 32 characters)
3. **Enable HTTPS** in production
4. **Configure CORS** appropriately for your frontend
5. **Set up rate limiting** based on your traffic patterns
6. **Use environment variables** for all sensitive data
7. **Regular security updates** for dependencies

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment mode | development |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRES_IN` | Access token expiry | 30m |
| `CORS_ORIGIN` | Allowed CORS origins | * |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Google Sheets API email | Optional |
| `GOOGLE_PRIVATE_KEY` | Google Sheets API key | Optional |
| `GA_MEASUREMENT_ID` | Google Analytics ID | Optional |
| `GA_API_SECRET` | GA4 API secret | Optional |
| `YANDEX_METRIKA_ID` | Yandex Metrika counter ID | Optional |
| `TELEGRAM_BOT_TOKEN` | Telegram Bot API token | Optional |
| `TELEGRAM_WEBHOOK_SECRET` | Webhook security token | Optional |
| `TELEGRAM_ADMIN_CHAT_ID` | Admin notification chat | Optional |

## 📝 Project Structure

```
src/
├── auth/              # Authentication module (JWT, Passport)
├── products/          # Product management
├── orders/            # Order processing
├── users/             # User management
├── import-export/     # CSV/XLSX/Google Sheets
├── integrations/      # Analytics integrations
├── webhook/           # Telegram webhook
├── prisma/            # Database service
├── common/            # Shared utilities
│   ├── decorators/    # Custom decorators
│   ├── filters/       # Exception filters
│   └── interceptors/  # Request interceptors
├── app.module.ts      # Root module
└── main.ts            # Application entry point
```

## 🚀 Performance Considerations

- **Async operations**: All I/O operations are non-blocking
- **Database indexing**: Key columns are indexed for fast queries
- **Rate limiting**: Prevents API abuse
- **Pagination**: All list endpoints support pagination
- **Caching headers**: Appropriate cache control for static resources

## 📞 Support

For issues, questions, or contributions:

1. Check existing issues
2. Review API documentation at `/api-docs`
3. Contact: admin@telegram-shop.com

## 📜 License

MIT License - See LICENSE file for details

---

**Built with NestJS** 🐱 | **Powered by TypeScript** 📦 | **Database: PostgreSQL** 🐘
