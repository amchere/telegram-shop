# 🤖 Telegram Bot Logic

## 📋 Table of Contents

- [Overview](#overview)
- [Bot Commands](#bot-commands)
- [Conversation Flows](#conversation-flows)
- [State Management](#state-management)
- [Handlers](#handlers)
- [Middleware](#middleware)
- [Notifications](#notifications)

## 🎯 Overview

The Telegram bot is built with **Grammy framework** and uses **conversations** plugin for dialog management.

**Bot Username:** @SmokyYardBot (example)

### Key Features
- ✅ Command handling
- ✅ Inline keyboards
- ✅ Conversation flows
- ✅ Session state management
- ✅ Auto-user creation
- ✅ Error handling
- ✅ Logging

---

## 📜 Bot Commands

### /start
**Description:** Main entry point, shows welcome message and main menu

**Response:**
```
👋 Привет, Ivan!

Добро пожаловать в наш магазин! 🛍

Здесь вы можете:
• Просмотреть каталог товаров
• Оформить заказ
• Просмотреть историю заказов

Выберите действие:

[📚 Каталог] [📄 Мои заказы]
[👤 Профиль] [ℹ️ Помощь]
```

**Implementation:** `bot/src/handlers/start.ts`

---

### /catalog
**Description:** Browse product catalog

**Flow:**
1. Shows list of products (5 per page)
2. Pagination with ⬅️ Prev / Next ➡️ buttons
3. Click product → product details
4. [Заказать] button → start order conversation

**Implementation:** `bot/src/handlers/catalog.ts`

---

### /orders
**Description:** View user's order history

**Response:**
```
📦 Ваши заказы:

#42 - 3000.00 ₽ - Pending
Создан: 04.12.2025 15:30

#41 - 1500.00 ₽ - Delivered
Создан: 03.12.2025 10:15

[◀️ Previous] [Next ▶️]
```

---

### /profile
**Description:** Show user profile information

**Response:**
```
👤 Ваш профиль:

ФИО: Ivan Petrov
Username: @ivanpetrov
Телефон: +79001234567
ID: 123456789

Заказов выполнено: 15
```

---

## 🔄 Conversation Flows

### Order Conversation

Complete order flow with 8 steps.

**Implementation:** `bot/src/conversations/order.ts`

#### Step 1: Product Selection
```
User clicks [Заказать] button on product
→ Bot starts conversation
→ Shows product with variants
```

#### Step 2: Variant Selection
```
Bot: "Выберите вариант:"
[Blue - M] [Blue - L]
[Red - M] [Red - L]

User clicks variant
→ Stored in session.orderData.variant_id
```

#### Step 3: Quantity Input
```
Bot: "Введите количество (доступно: 50 шт):"

User: "5"
→ Validates: number, > 0, <= stock
→ Stored in session.orderData.quantity
```

#### Step 4: Phone Number
```
Bot: "Введите номер телефона или нажмите кнопку:"
[📱 Поделиться контактом]

User shares contact OR types number
→ Validates format
→ Stored in session.orderData.phone
```

#### Step 5: Shipping Address
```
Bot: "Введите адрес доставки:"

User: "Moscow, Red Square, 1"
→ Stored in session.orderData.address
```

#### Step 6: Order Notes (Optional)
```
Bot: "Добавить комментарий? (или 'пропустить')"

User: "Deliver after 6 PM" OR "пропустить"
→ Stored in session.orderData.notes
```

#### Step 7: Confirmation
```
Bot: Shows order summary:

📦 Ваш заказ:

Товар: T-Shirt Blue (M)
Цена: 1500.00 ₽
Количество: 5
Итого: 7500.00 ₽

Контакт: Ivan Petrov, +79001234567
Адрес: Moscow, Red Square, 1
Примечание: Deliver after 6 PM

[✅ Подтвердить] [❌ Отменить]
```

#### Step 8: Order Creation
```
User clicks [✅ Подтвердить]
→ Bot sends POST /orders to API
→ API creates order in database
→ API returns order ID
→ Bot shows success message
→ Bot notifies admins
```

**Success message:**
```
✅ Заказ #42 успешно создан!

Наш менеджер свяжется с вами в ближайшее время.

Спасибо за заказ! ❤️
```

---

## 💾 State Management

### Session Structure

```typescript
interface SessionData {
  conversationData: ConversationData; // Grammy conversations
  userData: UserData | null;          // Cached user info
  currentProduct: Product | null;     // Currently viewing product
  orderData: OrderData | null;        // Order being created
}

interface OrderData {
  product_id: number;
  variant_id: number;
  quantity: number;
  phone: string;
  address: string;
  notes?: string;
}
```

### Session Initialization

```typescript
bot.use(session({
  initial(): SessionData {
    return {
      conversationData: {},
      userData: null,
      currentProduct: null,
      orderData: null,
    };
  },
}));
```

---

## 🎛️ Handlers

### Catalog Handler

**File:** `bot/src/handlers/catalog.ts`

**Responsibilities:**
- Fetch products from API
- Pagination (5 per page)
- Product details display
- Variant options

**Key Functions:**

```typescript
// Show catalog page
async function showCatalog(ctx, page = 1)

// Show product details
async function showProductDetails(ctx, productId)

// Handle variant selection
async function handleVariantSelection(ctx, variantId)
```

---

### Order Handler

**File:** `bot/src/handlers/order.ts`

**Responsibilities:**
- Start order conversation
- Show order history
- Order details view

**Key Functions:**

```typescript
// Show order history
async function showOrders(ctx, page = 1)

// Show specific order
async function showOrderDetails(ctx, orderId)
```

---

### Profile Handler

**File:** `bot/src/handlers/profile.ts`

**Responsibilities:**
- Display user info
- Order statistics

---

### Start Handler

**File:** `bot/src/handlers/start.ts`

**Responsibilities:**
- Welcome message
- Main menu display
- Help information

---

## 🔌 Middleware

### User Middleware

**File:** `bot/src/middleware/user.ts`

**Purpose:** Automatically create/update user in database from Telegram profile

**Flow:**
```
1. Every incoming message → middleware
2. Extract Telegram user data
3. Call POST /users/upsert
4. Store user in session
5. Continue to handler
```

**Implementation:**
```typescript
export async function userMiddleware(ctx: BotContext, next: NextFunction) {
  const telegramUser = ctx.from;
  if (!telegramUser) {
    return next();
  }

  try {
    const user = await apiClient.upsertUser({
      telegram_id: telegramUser.id,
      username: telegramUser.username,
      full_name: `${telegramUser.first_name} ${telegramUser.last_name || ''}`.trim(),
    });
    
    ctx.session.userData = user;
  } catch (error) {
    logger.error('Failed to upsert user:', error);
  }

  return next();
}
```

---

### Logging Middleware

**File:** `bot/src/middleware/logging.ts`

**Purpose:** Log all incoming messages/callbacks

**Logs:**
```json
{
  "level": "info",
  "message": "Incoming message",
  "userId": 123456789,
  "username": "ivanpetrov",
  "messageType": "text",
  "text": "/start",
  "timestamp": "2025-12-04T15:30:00.000Z"
}
```

---

### Error Handler Middleware

**File:** `bot/src/middleware/error-handler.ts`

**Purpose:** Catch and handle all errors

**Behavior:**
- Logs error details
- Shows user-friendly message
- Doesn't crash bot

**Error message:**
```
❌ Произошла ошибка. Попробуйте позже или обратитесь в поддержку.
```

---

## 📬 Notifications

### Customer Notifications

#### Order Created
```
✅ Заказ #42 успешно создан!

Наш менеджер свяжется с вами в ближайшее время.
```

#### Order Status Changed
```
📦 Статус заказа #42 изменен:
Pending → Processing

Ваш заказ обрабатывается.
```

---

### Admin Notifications

Sent to all admin Telegram IDs from `ADMIN_TELEGRAM_IDS` env variable.

#### New Order
```
🔔 Новый заказ #42

Клиент: Ivan Petrov (@ivanpetrov)
Телефон: +79001234567
Адрес: Moscow, Red Square, 1

Товары:
• T-Shirt Blue (M) x5 - 7500.00 ₽

Итого: 7500.00 ₽

[Обработать заказ →]
```

---

## 🔧 Utility Functions

### API Client

**File:** `bot/src/services/api-client.ts`

Wrapper around Axios for API calls.

**Methods:**
```typescript
class ApiClient {
  async getProducts(query): Promise<ProductListResponse>
  async getProductById(id): Promise<Product>
  async createOrder(data): Promise<Order>
  async getUserByTelegramId(id): Promise<User>
  async upsertUser(data): Promise<User>
}
```

---

### Formatters

**File:** `bot/src/utils/formatters.ts`

**Functions:**

```typescript
// Format price
formatPrice(1500) → "1500.00 ₽"

// Format date
formatDate(date) → "04.12.2025 15:30"

// Format product for display
formatProduct(product) → "T-Shirt Blue
1500.00 ₽
В наличии: 50 шт"

// Format order summary
formatOrderSummary(order) → "#42 - 3000.00 ₽ - Pending
Создан: 04.12.2025"
```

---

## 🐛 Error Handling

### Common Errors

#### API Unreachable
```typescript
try {
  const products = await apiClient.getProducts({page: 1});
} catch (error) {
  await ctx.reply('❌ Сервис временно недоступен. Попробуйте позже.');
  logger.error('API error:', error);
}
```

#### Out of Stock
```typescript
if (variant.stock_quantity < requestedQuantity) {
  await ctx.reply(`❌ Недостаточно товара. Доступно: ${variant.stock_quantity} шт`);
  return;
}
```

#### Invalid Input
```typescript
const quantity = parseInt(ctx.message.text);
if (isNaN(quantity) || quantity <= 0) {
  await ctx.reply('❌ Пожалуйста, введите корректное количество.');
  return;
}
```

---

## 📚 Additional Resources

- [Grammy Documentation](https://grammy.dev/)
- [Grammy Conversations](https://grammy.dev/plugins/conversations.html)
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- [DEVELOPMENT.md](./DEVELOPMENT.md)

---

**Updated:** 2025-12-04  
**Version:** 1.0.0
