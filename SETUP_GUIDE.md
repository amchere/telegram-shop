# Telegram Shop MVP - Setup Guide

Полное руководство по настройке и запуску Telegram-магазина MVP.

## 📦 Структура проекта

```
telegram_shop_backend/
├── nodejs_space/          # NestJS Backend API
│   ├── src/              # Исходный код API
│   ├── prisma/           # Database schema and migrations
│   └── dist/             # Compiled output
├── bot/                  # Telegram Bot (Node.js + Grammy)
│   ├── src/              # Bot source code
│   ├── logs/             # Bot logs
│   └── dist/             # Compiled output
├── docker-compose.yml    # Docker configuration
└── README.md            # Main documentation
```

## 🚀 Быстрый старт

### Вариант 1: Docker (рекомендуется для production)

1. **Клонируйте репозиторий и настройте переменные окружения:**

```bash
cd telegram_shop_backend
cp .env.example .env
```

2. **Отредактируйте `.env` файл:**

```env
# Backend API
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/telegram_shop?schema=public
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=30m
NODE_ENV=production

# Telegram Bot
BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz  # Получите от @BotFather
ADMIN_TELEGRAM_IDS=123456789,987654321          # Ваши Telegram IDs
```

3. **Запустите все сервисы:**

```bash
docker-compose up --build -d
```

Это запустит:
- PostgreSQL на порту 5432
- Backend API на порту 3000
- Telegram Bot

4. **Проверьте статус:**

```bash
docker-compose ps
docker-compose logs -f bot      # Логи бота
docker-compose logs -f api      # Логи API
```

5. **API документация доступна на:**
   - http://localhost:3000/api-docs

### Вариант 2: Local Development (для разработки)

#### Шаг 1: Настройка PostgreSQL

```bash
# Запустите PostgreSQL в Docker
docker run --name telegram_shop_postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=telegram_shop \
  -p 5432:5432 \
  -d postgres:15-alpine
```

#### Шаг 2: Запуск Backend API

```bash
cd nodejs_space

# Установите зависимости
yarn install

# Настройте .env
cp .env.example .env

# Примените миграции БД
yarn prisma db push

# Заполните тестовыми данными (опционально)
yarn prisma:seed

# Запустите API в dev режиме
yarn start:dev
```

API будет доступно на http://localhost:3000

#### Шаг 3: Запуск Telegram Bot

```bash
cd bot

# Установите зависимости
yarn install

# Настройте .env
cp .env.example .env

# Отредактируйте .env и добавьте BOT_TOKEN
nano .env

# Запустите бота в dev режиме
yarn dev
```

## 🤖 Настройка Telegram Bot

### 1. Создание бота

1. Откройте Telegram и найдите [@BotFather](https://t.me/botfather)
2. Отправьте команду `/newbot`
3. Следуйте инструкциям:
   - Введите имя бота (например: `My Shop Bot`)
   - Введите username бота (например: `my_shop_bot`)
4. BotFather отправит вам **BOT_TOKEN** - скопируйте его
5. Сохраните токен в `.env` файл:

```env
BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
```

### 2. Настройка команд бота

Отправьте BotFather команду `/setcommands`, выберите вашего бота и отправьте:

```
start - Главное меню
catalog - Просмотр каталога
orders - Мои заказы
profile - Мой профиль
```

### 3. Получение Telegram ID

Чтобы узнать свой Telegram ID:

1. Найдите бота [@userinfobot](https://t.me/userinfobot)
2. Отправьте ему `/start`
3. Бот отправит вам ваш ID (например: `123456789`)
4. Добавьте ID в `.env`:

```env
ADMIN_TELEGRAM_IDS=123456789,987654321
```

## 📊 Тестирование

### Backend API

```bash
cd nodejs_space

# Unit tests
yarn test

# E2E tests
yarn test:e2e

# Test coverage
yarn test:cov
```

### Telegram Bot

1. Откройте Telegram
2. Найдите вашего бота по username
3. Отправьте `/start`
4. Проверьте функционал:
   - Просмотр каталога
   - Выбор товара и варианта
   - Оформление заказа
   - Просмотр профиля

## 🔧 Полезные команды

### Docker

```bash
# Остановить все сервисы
docker-compose down

# Перезапустить сервис
docker-compose restart bot
docker-compose restart api

# Просмотр логов
docker-compose logs -f

# Войти в контейнер
docker exec -it telegram_shop_api sh
docker exec -it telegram_shop_bot sh

# Очистка (удаление volumes)
docker-compose down -v
```

### Database

```bash
cd nodejs_space

# Применить миграции
yarn prisma db push

# Просмотр БД в GUI
yarn prisma studio

# Seed database
yarn prisma:seed

# Reset database
yarn prisma migrate reset
```

### API

```bash
cd nodejs_space

# Development
yarn start:dev

# Production build
yarn build
yarn start:prod

# Linting
yarn lint

# Format code
yarn format
```

### Bot

```bash
cd bot

# Development
yarn dev

# Production build
yarn build
yarn start

# Linting
yarn lint
```

## 📖 API Endpoints

### Authentication
- `POST /api/auth/login` - Вход админа
- `POST /api/auth/refresh` - Обновление токена

### Products
- `GET /api/products` - Список товаров (pagination, filtering)
- `GET /api/products/:id` - Детали товара
- `POST /api/products` - Создание товара (admin)
- `PUT /api/products/:id` - Обновление товара (admin)
- `DELETE /api/products/:id` - Удаление товара (admin)

### Orders
- `GET /api/orders` - Список заказов
- `GET /api/orders/:id` - Детали заказа
- `POST /api/orders` - Создание заказа
- `PUT /api/orders/:id/status` - Изменение статуса (admin)

### Users
- `GET /api/users` - Список пользователей (admin)
- `GET /api/users/:id` - Профиль пользователя
- `POST /api/users/upsert` - Создание/обновление пользователя

### Import/Export
- `POST /api/import/csv` - Импорт из CSV
- `POST /api/import/sheets` - Импорт из Google Sheets
- `GET /api/export/xlsx` - Экспорт в XLSX

Полная документация: http://localhost:3000/api-docs

## 🔐 Безопасность

1. **Измените JWT_SECRET** в production:
```env
JWT_SECRET=$(openssl rand -base64 32)
```

2. **Используйте сильные пароли БД** в production

3. **Настройте HTTPS** для production deployment

4. **Регулярно обновляйте зависимости**:
```bash
yarn upgrade-interactive
```

## 🐛 Troubleshooting

### Bot не отвечает

1. Проверьте логи:
```bash
docker-compose logs bot
# или локально
cd bot && tail -f logs/combined.log
```

2. Убедитесь, что BOT_TOKEN правильный

3. Проверьте, что API запущено и доступно:
```bash
curl http://localhost:3000/api/products
```

### API не запускается

1. Проверьте, что PostgreSQL запущен:
```bash
docker-compose ps postgres
```

2. Проверьте DATABASE_URL в .env

3. Проверьте логи:
```bash
docker-compose logs api
```

### База данных не подключается

1. Проверьте, что PostgreSQL запущен:
```bash
docker ps | grep postgres
```

2. Проверьте подключение:
```bash
psql postgresql://postgres:postgres@localhost:5432/telegram_shop
```

3. Пересоздайте БД:
```bash
docker-compose down -v
docker-compose up -d postgres
```

## 📚 Дополнительная информация

- [NestJS Backend README](nodejs_space/README.md)
- [Telegram Bot README](bot/README.md)
- [Technical Specification](../telegram_shop_mvp/docs/TECH_SPEC.md)
- [Deployment Guide](../telegram_shop_mvp/docs/deployment_guide.md)

## 🤝 Поддержка

По вопросам обращайтесь к команде разработки.

## 📄 Лицензия

ISC
