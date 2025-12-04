# 📡 API Documentation

## 📋 Table of Contents

- [Base URL](#base-url)
- [Authentication](#authentication)
- [Common Response Codes](#common-response-codes)
- [Public Endpoints](#public-endpoints)
- [Authentication Endpoints](#authentication-endpoints)
- [Admin Endpoints](#admin-endpoints)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

## 🌐 Base URL

**Development:** `http://localhost:3000/api`  
**Production:** `https://smokyyard.abacusai.app/api`

**Swagger Documentation:** `http://localhost:3000/api-docs`

---

## 🔐 Authentication

### JWT Token

Protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### Getting a Token

```bash
curl -X POST http://localhost:3000/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

---

## 📊 Common Response Codes

| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created |
| 204 | No Content | Delete successful |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 422 | Unprocessable Entity | Validation error |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

---

## 🌍 Public Endpoints

### Products

#### GET /products

Get list of active products with pagination.

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10, max: 100)
- `category` (number, optional): Filter by category ID
- `search` (string, optional): Search in name/description

**Example:**
```bash
curl "http://localhost:3000/api/products?page=1&limit=10"
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "T-Shirt Blue",
      "description": "Comfortable cotton t-shirt",
      "category": {
        "id": 1,
        "name": "Clothing"
      },
      "variants": [
        {
          "id": 1,
          "sku": "TSHIRT-BLUE-M",
          "price": "1500.00",
          "stock_quantity": 50,
          "images": ["https://example.com/image1.jpg"]
        }
      ],
      "is_active": true
    }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

---

#### GET /products/:id

Get product details by ID.

**Parameters:**
- `id` (number): Product ID

**Example:**
```bash
curl "http://localhost:3000/api/products/1"
```

**Response:**
```json
{
  "id": 1,
  "name": "T-Shirt Blue",
  "description": "Comfortable cotton t-shirt",
  "category": {
    "id": 1,
    "name": "Clothing",
    "parent_id": null
  },
  "variants": [
    {
      "id": 1,
      "sku": "TSHIRT-BLUE-M",
      "price": "1500.00",
      "stock_quantity": 50,
      "weight": "0.3",
      "dimensions": "40x30x2 cm",
      "images": ["https://example.com/image1.jpg"],
      "options": [
        {"type": "Color", "value": "Blue"},
        {"type": "Size", "value": "M"}
      ]
    }
  ],
  "is_active": true,
  "created_at": "2025-12-01T10:00:00.000Z"
}
```

---

### Categories

#### GET /categories

Get all categories with hierarchy.

**Example:**
```bash
curl "http://localhost:3000/api/categories"
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Clothing",
    "parent_id": null,
    "children": [
      {
        "id": 2,
        "name": "T-Shirts",
        "parent_id": 1
      }
    ]
  }
]
```

---

### Orders

#### POST /orders

Create a new order (for bot integration).

**Request Body:**
```json
{
  "user_id": 123456789,
  "items": [
    {
      "variant_id": 1,
      "quantity": 2
    }
  ],
  "shipping_address": "Moscow, Red Square, 1",
  "customer_contact": "Ivan Petrov, +79001234567",
  "notes": "Please deliver after 6 PM"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 123456789,
    "items": [{"variant_id": 1, "quantity": 2}],
    "shipping_address": "Moscow, Red Square, 1",
    "customer_contact": "Ivan Petrov, +79001234567"
  }'
```

**Response:**
```json
{
  "id": 42,
  "user_id": 123456789,
  "status": "pending",
  "total_amount": "3000.00",
  "shipping_address": "Moscow, Red Square, 1",
  "customer_contact": "Ivan Petrov, +79001234567",
  "notes": "Please deliver after 6 PM",
  "created_at": "2025-12-04T15:30:00.000Z",
  "items": [
    {
      "id": 1,
      "variant": {
        "id": 1,
        "sku": "TSHIRT-BLUE-M",
        "product_name": "T-Shirt Blue"
      },
      "quantity": 2,
      "price_at_purchase": "1500.00"
    }
  ]
}
```

---

### Users (Public - Bot Integration)

#### GET /users/telegram/:telegramId

Get user by Telegram ID.

**Parameters:**
- `telegramId` (number): Telegram User ID

**Example:**
```bash
curl "http://localhost:3000/api/users/telegram/123456789"
```

**Response:**
```json
{
  "id": 1,
  "telegram_id": 123456789,
  "full_name": "Ivan Petrov",
  "username": "ivanpetrov",
  "phone_number": "+79001234567",
  "created_at": "2025-12-01T10:00:00.000Z"
}
```

---

#### POST /users/upsert

Create or update user from Telegram data.

**Request Body:**
```json
{
  "telegram_id": 123456789,
  "username": "ivanpetrov",
  "full_name": "Ivan Petrov",
  "phone_number": "+79001234567"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/users/upsert \
  -H "Content-Type: application/json" \
  -d '{
    "telegram_id": 123456789,
    "username": "ivanpetrov",
    "full_name": "Ivan Petrov",
    "phone_number": "+79001234567"
  }'
```

---

## 🔑 Authentication Endpoints

### POST /auth/token

Admin login and token generation.

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "role": "admin",
    "is_active": true
  }
}
```

---

## 👑 Admin Endpoints

All admin endpoints require JWT authentication and appropriate role.

### Products Management

#### GET /admin/products

Get all products (including inactive).

**Headers:**
- `Authorization: Bearer <token>`

**Query Parameters:**
- `page`, `limit`, `category`, `search` (same as public endpoint)
- `is_active` (boolean, optional): Filter by active status

**Example:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/admin/products?is_active=false"
```

---

#### POST /admin/products

Create a new product.

**Headers:**
- `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "New T-Shirt",
  "description": "Amazing new t-shirt",
  "category_id": 1,
  "is_active": true
}
```

**Response:** Product detail object

---

#### PUT /admin/products/:id

Update existing product.

**Headers:**
- `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Updated T-Shirt",
  "description": "Updated description",
  "is_active": false
}
```

---

#### DELETE /admin/products/:id

Delete product (cascade deletes variants).

**Headers:**
- `Authorization: Bearer <token>`

**Response:** `204 No Content`

---

### Orders Management

#### GET /admin/orders

Get all orders with filters.

**Headers:**
- `Authorization: Bearer <token>`

**Query Parameters:**
- `page`, `limit`
- `status` (string): pending, processing, shipped, delivered, cancelled
- `date_from` (ISO date): Start date filter
- `date_to` (ISO date): End date filter
- `user_id` (number): Filter by user

**Example:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/admin/orders?status=pending&page=1"
```

**Response:**
```json
{
  "data": [
    {
      "id": 42,
      "user": {
        "id": 1,
        "telegram_id": 123456789,
        "full_name": "Ivan Petrov"
      },
      "status": "pending",
      "total_amount": "3000.00",
      "created_at": "2025-12-04T15:30:00.000Z",
      "items_count": 2
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 10
  }
}
```

---

#### GET /admin/orders/:id

Get detailed order information.

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "id": 42,
  "user": {
    "id": 1,
    "telegram_id": 123456789,
    "full_name": "Ivan Petrov",
    "username": "ivanpetrov",
    "phone_number": "+79001234567"
  },
  "status": "pending",
  "total_amount": "3000.00",
  "shipping_address": "Moscow, Red Square, 1",
  "customer_contact": "Ivan Petrov, +79001234567",
  "notes": "Please deliver after 6 PM",
  "created_at": "2025-12-04T15:30:00.000Z",
  "updated_at": "2025-12-04T15:30:00.000Z",
  "items": [
    {
      "id": 1,
      "variant": {
        "id": 1,
        "sku": "TSHIRT-BLUE-M",
        "product": {
          "id": 1,
          "name": "T-Shirt Blue"
        }
      },
      "quantity": 2,
      "price_at_purchase": "1500.00"
    }
  ]
}
```

---

#### PATCH /admin/orders/:id

Update order status.

**Headers:**
- `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "status": "processing"
}
```

**Valid statuses:** `pending`, `processing`, `shipped`, `delivered`, `cancelled`

---

### Users Management

#### GET /admin/users

Get all users.

**Headers:**
- `Authorization: Bearer <token>`

**Query Parameters:**
- `page`, `limit`
- `search` (string): Search in name/username

---

### Import/Export

#### POST /admin/import/csv

Import products from CSV file.

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Form Data:**
- `file`: CSV file

**CSV Format:**
```csv
name,description,category_id,sku,price,stock_quantity
"T-Shirt Red","Comfortable red t-shirt",1,"TSHIRT-RED-M",1500,100
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/admin/import/csv \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@products.csv"
```

**Response:**
```json
{
  "success": 10,
  "failed": 2,
  "errors": [
    {
      "row": 3,
      "error": "Invalid category_id"
    }
  ]
}
```

---

#### POST /admin/import/xlsx

Import products from XLSX file (same format as CSV).

---

#### POST /admin/import/google-sheets

Import products from Google Sheets.

**Request Body:**
```json
{
  "spreadsheet_id": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
  "range": "Sheet1!A1:F100"
}
```

---

#### GET /admin/export/csv

Export orders to CSV.

**Headers:**
- `Authorization: Bearer <token>`

**Query Parameters:**
- `date_from`, `date_to`
- `status`

**Returns:** CSV file download

---

#### GET /admin/export/xlsx

Export orders to XLSX (same as CSV).

---

#### POST /admin/export/google-sheets

Export orders to Google Sheets.

**Request Body:**
```json
{
  "spreadsheet_id": "...",
  "sheet_name": "Orders",
  "date_from": "2025-12-01",
  "date_to": "2025-12-31"
}
```

---

## ⚠️ Error Handling

All errors follow a consistent format:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "name",
      "constraints": {
        "minLength": "name must be longer than or equal to 3 characters"
      }
    }
  ],
  "timestamp": "2025-12-04T15:30:00.000Z",
  "path": "/api/products"
}
```

---

## 🚦 Rate Limiting

- **Default:** 100 requests per minute per IP
- **Admin endpoints:** 500 requests per minute

**Rate limit headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1733329800
```

---

## 📚 Additional Resources

- **Swagger UI:** http://localhost:3000/api-docs
- **Production API:** https://smokyyard.abacusai.app/api-docs
- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [SETUP.md](./SETUP.md)

---

**Updated:** 2025-12-04  
**Version:** 1.0.0
