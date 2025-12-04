# 🗄️ Database Documentation

## 📋 Table of Contents

- [Overview](#overview)
- [Schema Diagram](#schema-diagram)
- [Tables](#tables)
- [Relationships](#relationships)
- [Indexes](#indexes)
- [Migrations](#migrations)
- [Seed Data](#seed-data)

## 🎯 Overview

**Database:** PostgreSQL 15  
**ORM:** Prisma 6.0  
**Schema File:** `nodejs_space/prisma/schema.prisma`

### Connection String Format

```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
```

**Development:**
```
postgresql://postgres:postgres@localhost:5432/telegram_shop?schema=public
```

---

## 📊 Schema Diagram

```
┌─────────────────┐       ┌──────────────────┐
│   categories    │◄──┐   │   admin_users    │
│                 │   │   │                  │
│ • id (PK)       │   │   │ • id (PK)        │
│ • name          │   │   │ • username       │
│ • parent_id (FK)│───┘   │ • email          │
└────────┬────────┘       │ • password_hash  │
         │                │ • role           │
         │                └────────┬─────────┘
         │                         │
         │                         │
┌────────▼────────┐       ┌────────▼─────────┐
│    products     │       │   audit_logs     │
│                 │       │                  │
│ • id (PK)       │       │ • id (PK)        │
│ • name          │       │ • admin_user_id  │
│ • description   │       │ • action         │
│ • category_id   │       │ • entity_type    │
│ • is_active     │       │ • entity_id      │
└────────┬────────┘       │ • changes        │
         │                └──────────────────┘
         │
┌────────▼────────────────┐
│   product_variants      │
│                         │
│ • id (PK)               │
│ • product_id (FK)       │
│ • sku                   │
│ • price                 │
│ • stock_quantity        │
│ • images[]              │
└────────┬────────────────┘
         │
         ├──────────────────┐
         │                  │
┌────────▼────────┐  ┌──────▼──────────┐
│ variant_values  │  │  order_items    │
│                 │  │                 │
│ • variant_id    │  │ • id (PK)       │
│ • option_val_id │  │ • order_id (FK) │
└────────┬────────┘  │ • variant_id    │
         │           │ • quantity      │
         │           │ • price         │
┌────────▼────────┐  └──────┬──────────┘
│  option_values  │         │
│                 │         │
│ • id (PK)       │  ┌──────▼──────────┐
│ • option_type   │  │     orders      │
│ • value         │  │                 │
└────────┬────────┘  │ • id (PK)       │
         │           │ • user_id (FK)  │
┌────────▼────────┐  │ • status        │
│  option_types   │  │ • total_amount  │
│                 │  │ • address       │
│ • id (PK)       │  │ • contact       │
│ • name          │  └──────┬──────────┘
└─────────────────┘         │
                            │
                   ┌────────▼────────┐
                   │     users       │
                   │                 │
                   │ • id (PK)       │
                   │ • telegram_id   │
                   │ • full_name     │
                   │ • username      │
                   │ • phone_number  │
                   └─────────────────┘
```

---

## 📋 Tables

### users

Telegram customers who use the bot.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | BigInt | No | autoincrement() | Primary key |
| telegram_id | BigInt | Yes | NULL | Telegram User ID (unique) |
| full_name | String(255) | No | - | User's full name |
| username | String(255) | Yes | NULL | Telegram username |
| phone_number | String(50) | Yes | NULL | Phone number |
| created_at | Timestamp | No | now() | Registration date |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE (telegram_id)
- INDEX (username)

**Example:**
```sql
SELECT * FROM users WHERE telegram_id = 123456789;
```

---

### admin_users

System administrators and managers.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | Int | No | autoincrement() | Primary key |
| username | String(100) | No | - | Login username |
| email | String(255) | No | - | Email address |
| password_hash | String(255) | No | - | Bcrypt password hash |
| role | String(50) | No | 'manager' | admin or manager |
| is_active | Boolean | No | true | Account status |
| created_at | Timestamp | No | now() | Creation date |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE (username)
- UNIQUE (email)
- INDEX (username, email)

**Example:**
```sql
SELECT * FROM admin_users WHERE username = 'admin' AND is_active = true;
```

---

### categories

Product categories with hierarchical structure.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | Int | No | autoincrement() | Primary key |
| name | String(255) | No | - | Category name |
| parent_id | Int | Yes | NULL | Parent category ID |

**Indexes:**
- PRIMARY KEY (id)
- INDEX (parent_id)
- FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE

**Example:**
```sql
-- Get root categories
SELECT * FROM categories WHERE parent_id IS NULL;

-- Get subcategories
SELECT * FROM categories WHERE parent_id = 1;
```

---

### products

Products in the catalog.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | Int | No | autoincrement() | Primary key |
| name | String(255) | No | - | Product name |
| description | Text | No | - | Product description |
| category_id | Int | No | - | Category reference |
| is_active | Boolean | No | true | Visibility status |
| created_at | Timestamp | No | now() | Creation date |

**Indexes:**
- PRIMARY KEY (id)
- INDEX (category_id)
- INDEX (name)
- INDEX (is_active)
- FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE

**Example:**
```sql
SELECT * FROM products 
WHERE is_active = true AND category_id = 1
ORDER BY created_at DESC;
```

---

### product_variants

SKU-level product variants (size, color combinations).

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | Int | No | autoincrement() | Primary key |
| product_id | Int | No | - | Product reference |
| sku | String(100) | No | - | Stock Keeping Unit (unique) |
| price | Decimal(10,2) | No | - | Variant price |
| stock_quantity | Int | No | 0 | Available quantity |
| weight | Decimal(10,2) | Yes | NULL | Weight in kg |
| dimensions | String(255) | Yes | NULL | LxWxH in cm |
| images | String[] | No | [] | Array of image URLs |
| created_at | Timestamp | No | now() | Creation date |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE (sku)
- INDEX (product_id)
- FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE

**Example:**
```sql
SELECT * FROM product_variants 
WHERE product_id = 1 AND stock_quantity > 0;
```

---

### option_types

Types of product options (Color, Size, Material, etc.).

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | Int | No | autoincrement() | Primary key |
| name | String(100) | No | - | Option type name (unique) |

**Example:**
```sql
INSERT INTO option_types (name) VALUES ('Color'), ('Size');
```

---

### option_values

Possible values for option types (Red, Blue, M, L, etc.).

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | Int | No | autoincrement() | Primary key |
| option_type_id | Int | No | - | Option type reference |
| value | String(100) | No | - | Option value |

**Indexes:**
- PRIMARY KEY (id)
- INDEX (option_type_id)
- FOREIGN KEY (option_type_id) REFERENCES option_types(id) ON DELETE CASCADE

**Example:**
```sql
-- Get all colors
SELECT ov.* FROM option_values ov
JOIN option_types ot ON ov.option_type_id = ot.id
WHERE ot.name = 'Color';
```

---

### variant_values

Junction table linking variants to their option values.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| variant_id | Int | No | - | Variant reference |
| option_value_id | Int | No | - | Option value reference |

**Indexes:**
- PRIMARY KEY (variant_id, option_value_id)
- FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE
- FOREIGN KEY (option_value_id) REFERENCES option_values(id) ON DELETE CASCADE

**Example:**
```sql
-- Get all options for a variant
SELECT ot.name AS type, ov.value
FROM variant_values vv
JOIN option_values ov ON vv.option_value_id = ov.id
JOIN option_types ot ON ov.option_type_id = ot.id
WHERE vv.variant_id = 1;
```

---

### orders

Customer orders.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | Int | No | autoincrement() | Primary key |
| user_id | BigInt | No | - | User reference |
| status | String(50) | No | 'pending' | Order status |
| total_amount | Decimal(10,2) | No | - | Total order amount |
| shipping_address | Text | No | - | Delivery address |
| customer_contact | Text | No | - | Name and phone |
| notes | Text | Yes | NULL | Customer notes |
| created_at | Timestamp | No | now() | Order date |
| updated_at | Timestamp | No | now() | Last update |

**Valid statuses:** `pending`, `processing`, `shipped`, `delivered`, `cancelled`

**Indexes:**
- PRIMARY KEY (id)
- INDEX (user_id)
- INDEX (status)
- INDEX (created_at)
- FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE

**Example:**
```sql
SELECT * FROM orders 
WHERE status = 'pending' 
ORDER BY created_at DESC;
```

---

### order_items

Items within an order.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | Int | No | autoincrement() | Primary key |
| order_id | Int | No | - | Order reference |
| variant_id | Int | No | - | Variant reference |
| quantity | Int | No | - | Quantity ordered |
| price_at_purchase | Decimal(10,2) | No | - | Price at time of order |

**Indexes:**
- PRIMARY KEY (id)
- INDEX (order_id)
- INDEX (variant_id)
- FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
- FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE RESTRICT

**Example:**
```sql
SELECT oi.*, pv.sku, p.name
FROM order_items oi
JOIN product_variants pv ON oi.variant_id = pv.id
JOIN products p ON pv.product_id = p.id
WHERE oi.order_id = 42;
```

---

### audit_logs

Audit trail of admin actions.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | Int | No | autoincrement() | Primary key |
| admin_user_id | Int | No | - | Admin reference |
| action | String(100) | No | - | CREATE, UPDATE, DELETE |
| entity_type | String(100) | No | - | products, orders, users |
| entity_id | Int | Yes | NULL | ID of affected entity |
| changes | Text | Yes | NULL | JSON of changes |
| created_at | Timestamp | No | now() | Action timestamp |

**Indexes:**
- PRIMARY KEY (id)
- INDEX (admin_user_id)
- INDEX (entity_type, entity_id)
- INDEX (created_at)
- FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE CASCADE

**Example:**
```sql
SELECT * FROM audit_logs 
WHERE entity_type = 'products' AND entity_id = 1
ORDER BY created_at DESC;
```

---

## 🔗 Relationships

### One-to-Many

```
categories (1) ←→ (N) categories (self-referencing)
categories (1) ←→ (N) products
products (1) ←→ (N) product_variants
option_types (1) ←→ (N) option_values
users (1) ←→ (N) orders
orders (1) ←→ (N) order_items
admin_users (1) ←→ (N) audit_logs
```

### Many-to-Many

```
product_variants (N) ←→ (N) option_values
    (через variant_values)
```

---

## 🔍 Indexes

### Purpose

- **Primary Keys:** Fast row lookup
- **Foreign Keys:** Efficient joins
- **Search Fields:** Quick filtering

### Index Usage Examples

```sql
-- Uses INDEX on telegram_id
SELECT * FROM users WHERE telegram_id = 123456789;

-- Uses INDEX on category_id and is_active
SELECT * FROM products 
WHERE category_id = 1 AND is_active = true;

-- Uses INDEX on status and created_at
SELECT * FROM orders 
WHERE status = 'pending' 
ORDER BY created_at DESC;
```

---

## 🔄 Migrations

### Applying Schema

```bash
cd nodejs_space

# Push schema to database (development)
yarn prisma db push

# Generate Prisma Client
yarn prisma generate

# View current schema
yarn prisma db pull
```

### Schema Location

`nodejs_space/prisma/schema.prisma`

### Making Changes

1. Edit `schema.prisma`
2. Run `yarn prisma db push`
3. Generate client: `yarn prisma generate`
4. Restart application

**Example:**

```prisma
// Add new field
model products {
  // ... existing fields
  discount_percent Int? @default(0)
}
```

```bash
yarn prisma db push
yarn prisma generate
```

---

## 🌱 Seed Data

### Location

`nodejs_space/prisma/seed.ts`

### Running Seed

```bash
cd nodejs_space
yarn prisma db seed
```

### What Gets Seeded

1. **Admin User:**
   - Username: `admin`
   - Password: `admin123`
   - Email: `admin@example.com`
   - Role: `admin`

2. **Categories:**
   - Clothing
     - T-Shirts
     - Jeans
   - Electronics
   - Home & Garden

3. **Products:**
   - 10 sample products with variants
   - Different categories
   - Multiple images
   - Stock quantities

4. **Option Types:**
   - Color
   - Size

5. **Option Values:**
   - Colors: Red, Blue, Green, Black, White
   - Sizes: XS, S, M, L, XL, XXL

### Custom Seed

Edit `prisma/seed.ts`:

```typescript
async function main() {
  // Create admin
  await prisma.admin_users.create({
    data: {
      username: 'myAdmin',
      email: 'my@email.com',
      password_hash: await bcrypt.hash('myPassword', 10),
      role: 'admin',
    },
  });

  // Add more seed data...
}

main();
```

---

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [DEVELOPMENT.md](./DEVELOPMENT.md)

---

**Updated:** 2025-12-04  
**Version:** 1.0.0
