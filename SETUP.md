# 🚀 Установка и настройка Telegram Shop MVP

## 📋 Оглавление

- [Системные требования](#системные-требования)
- [Метод 1: Docker Compose (рекомендуется)](#метод-1-docker-compose-рекомендуется)
- [Метод 2: Локальная разработка](#метод-2-локальная-разработка)
- [Метод 3: Развертывание на Ubuntu сервере](#метод-3-развертывание-на-ubuntu-сервере)
- [Первый запуск](#первый-запуск)
- [Проверка работы](#проверка-работы)
- [Остановка и управление](#остановка-и-управление)

## 💻 Системные требования

### Минимальные требования

- **CPU:** 2 ядра
- **RAM:** 2GB
- **Диск:** 10GB свободного места
- **ОС:** Ubuntu 20.04+ / Debian 11+ / macOS / Windows 10+

### Программное обеспечение

#### Для Docker метода:
- Docker 20.10+
- Docker Compose 2.0+

#### Для локальной разработки:
- Node.js 18+ (LTS)
- Yarn 4+
- PostgreSQL 15+
- Git

### Получение Telegram Bot Token

1. Откройте Telegram и найдите [@BotFather](https://t.me/botfather)
2. Отправьте `/newbot`
3. Следуйте инструкциям (имя бота, username)
4. Получите токен вида: `1234567890:ABCdefGhIjKlmNoPqRsTuVwXyZ`
5. Сохраните токен для дальнейшей настройки

---

## 📦 Метод 1: Docker Compose (рекомендуется)

Самый простой и быстрый способ запуска.

### Шаг 1: Распаковка проекта

```bash
# Распаковать архив
tar -xzf telegram_shop_backend.tar.gz

# Перейти в директорию
cd telegram_shop_backend
```

### Шаг 2: Настройка environment variables

```bash
# Создать .env из примера
cp .env.example .env

# Редактировать .env
nano .env
```

**Содержимое .env:**

```env
# Backend API
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/telegram_shop?schema=public
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-in-production-minimum-32-characters
JWT_EXPIRES_IN=30m
NODE_ENV=production

# Telegram Bot
BOT_TOKEN=ваш_telegram_bot_token_здесь
ADMIN_TELEGRAM_IDS=123456789,987654321

# Optional: CORS origins (comma-separated)
CORS_ORIGIN=*

# Optional: Analytics
# GA4_MEASUREMENT_ID=G-XXXXXXXXXX
# YANDEX_METRIKA_ID=12345678
```

**Важно:**
- Замените `BOT_TOKEN` на реальный токен от @BotFather
- Укажите ваш Telegram ID в `ADMIN_TELEGRAM_IDS` (узнать: [@userinfobot](https://t.me/userinfobot))
- Обязательно смените `JWT_SECRET` на случайную строку минимум 32 символа

### Шаг 3: Запуск

```bash
# Запустить все сервисы
docker-compose up -d

# Проверить статус
docker-compose ps

# Просмотр логов
docker-compose logs -f
```

**Что запустится:**
- PostgreSQL база данных (порт 5432)
- Backend API (порт 3000)
- Telegram Bot

### Шаг 4: Инициализация базы данных

База данных автоматически создастся и заполнится тестовыми данными при первом запуске API.

**Тестовые данные включают:**
- Админ: `username: admin`, `password: admin123`
- 10 товаров с вариантами
- 3 категории

---

## 🛠️ Метод 2: Локальная разработка

Для разработчиков, которым нужен прямой доступ к коду.

### Шаг 1: Установка зависимостей

#### macOS (с Homebrew):

```bash
# Node.js
brew install node@18

# Yarn
npm install -g yarn

# PostgreSQL
brew install postgresql@15
brew services start postgresql@15
```

#### Ubuntu/Debian:

```bash
# Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Yarn
npm install -g yarn

# PostgreSQL 15
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
sudo apt-get update
sudo apt-get install -y postgresql-15
```

#### Windows:

1. Установите [Node.js 18 LTS](https://nodejs.org/)
2. Установите [PostgreSQL 15](https://www.postgresql.org/download/windows/)
3. Откройте PowerShell и выполните: `npm install -g yarn`

### Шаг 2: Настройка PostgreSQL

```bash
# Подключиться к PostgreSQL
sudo -u postgres psql

# Создать базу данных
CREATE DATABASE telegram_shop;
CREATE USER shopuser WITH PASSWORD 'shoppassword';
GRANT ALL PRIVILEGES ON DATABASE telegram_shop TO shopuser;

# Выход
\q
```

### Шаг 3: Настройка Backend API

```bash
cd telegram_shop_backend/nodejs_space

# Установить зависимости
yarn install

# Создать .env
cat > .env << 'EOF'
DATABASE_URL=postgresql://shopuser:shoppassword@localhost:5432/telegram_shop?schema=public
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=30m
NODE_ENV=development
CORS_ORIGIN=*
EOF

# Применить схему БД
yarn prisma db push

# Заполнить тестовыми данными
yarn prisma db seed

# Скомпилировать
yarn build

# Запустить в dev режиме
yarn start:dev

# Или в production режиме
yarn start:prod
```

API будет доступен на http://localhost:3000

### Шаг 4: Настройка Telegram Bot

**Откройте новый терминал:**

```bash
cd telegram_shop_backend/bot

# Установить зависимости
yarn install

# Создать .env
cat > .env << 'EOF'
BOT_TOKEN=ваш_telegram_bot_token_здесь
API_BASE_URL=http://localhost:3000/api
API_TIMEOUT=10000
ADMIN_TELEGRAM_IDS=123456789
NODE_ENV=development
LOG_LEVEL=debug
EOF

# Скомпилировать
yarn build

# Запустить в dev режиме
yarn dev

# Или в production режиме
yarn start
```

### Шаг 5: Управление процессами с PM2 (опционально)

PM2 позволяет запускать процессы в фоне с автозапуском.

```bash
# Установить PM2
npm install -g pm2

# Backend API
cd telegram_shop_backend/nodejs_space
pm2 start dist/main.js --name telegram-shop-api

# Telegram Bot
cd ../bot
pm2 start dist/index.js --name telegram-shop-bot

# Просмотр логов
pm2 logs

# Автозапуск при перезагрузке
pm2 startup
pm2 save

# Управление
pm2 restart telegram-shop-api
pm2 stop telegram-shop-bot
pm2 delete telegram-shop-api
```

---

## 🌐 Метод 3: Развертывание на Ubuntu сервере

Полноценное production развертывание на VPS/dedicated сервере.

### Предварительные требования

- Ubuntu 20.04+ сервер
- Доступ по SSH
- Доменное имя (опционально, для HTTPS)
- Минимум 2GB RAM

### Шаг 1: Подготовка сервера

```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Добавление пользователя в группу docker
sudo usermod -aG docker $USER

# Перелогиниться для применения изменений
exit
# SSH снова

# Установка Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Проверка установки
docker --version
docker-compose --version
```

### Шаг 2: Загрузка проекта

```bash
# Создать директорию
mkdir -p ~/apps
cd ~/apps

# Загрузить проект (через SCP или Git)
# Вариант 1: SCP с локального компьютера
# scp telegram_shop_backend.tar.gz user@your-server-ip:~/apps/

# Вариант 2: Wget если файл на сервере
# wget https://your-domain.com/telegram_shop_backend.tar.gz

# Распаковать
tar -xzf telegram_shop_backend.tar.gz
cd telegram_shop_backend
```

### Шаг 3: Настройка .env

```bash
nano .env
```

**Production .env:**

```env
DATABASE_URL=postgresql://postgres:YourStrongPassword123@postgres:5432/telegram_shop?schema=public
PORT=3000
JWT_SECRET=your-production-secret-min-32-chars-random-string-here
JWT_EXPIRES_IN=30m
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com

BOT_TOKEN=ваш_реальный_telegram_bot_token
ADMIN_TELEGRAM_IDS=ваш_telegram_id

# Analytics (опционально)
GA4_MEASUREMENT_ID=G-XXXXXXXXXX
YANDEX_METRIKA_ID=12345678
```

### Шаг 4: Запуск с Docker Compose

```bash
# Запуск
docker-compose up -d

# Проверка
docker-compose ps
docker-compose logs -f api
docker-compose logs -f bot

# Проверка API
curl http://localhost:3000/api/products
```

### Шаг 5: Настройка Nginx (опционально)

Для публичного доступа по доменному имени.

```bash
# Установка Nginx
sudo apt install nginx -y

# Создать конфиг
sudo nano /etc/nginx/sites-available/telegram-shop
```

**Содержимое конфига:**

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Redirect to HTTPS (после установки SSL)
    # return 301 https://$server_name$request_uri;

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /api-docs {
        proxy_pass http://localhost:3000/api-docs;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }
}
```

```bash
# Активировать конфиг
sudo ln -s /etc/nginx/sites-available/telegram-shop /etc/nginx/sites-enabled/

# Проверить конфигурацию
sudo nginx -t

# Перезапустить Nginx
sudo systemctl restart nginx

# Включить автозапуск
sudo systemctl enable nginx
```

### Шаг 6: Установка SSL с Let's Encrypt

```bash
# Установить Certbot
sudo apt install certbot python3-certbot-nginx -y

# Получить сертификат
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Автоматическое обновление сертификата
sudo systemctl status certbot.timer
```

После установки SSL раскомментируйте строку redirect в Nginx конфиге.

### Шаг 7: Мониторинг и логи

```bash
# Логи Docker
docker-compose logs -f

# Логи Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Статус сервисов
docker-compose ps
sudo systemctl status nginx
```

---

## 🎬 Первый запуск

После успешной установки любым методом:

### 1. Проверка API

```bash
# Health check
curl http://localhost:3000/api

# Список товаров
curl http://localhost:3000/api/products

# Категории
curl http://localhost:3000/api/categories

# Swagger документация
# Откройте в браузере: http://localhost:3000/api-docs
```

### 2. Получение JWT токена для админки

```bash
curl -X POST http://localhost:3000/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

**Ответ:**
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

### 3. Проверка Telegram бота

1. Откройте Telegram
2. Найдите вашего бота (по username)
3. Отправьте `/start`
4. Должно появиться приветственное сообщение с меню

**Если бот не отвечает:**

```bash
# Проверьте логи бота
docker-compose logs bot
# или
pm2 logs telegram-shop-bot
```

---

## ✅ Проверка работы

### Checklist

- [ ] API доступен на порту 3000
- [ ] Swagger документация открывается
- [ ] PostgreSQL запущен и доступен
- [ ] Telegram бот отвечает на `/start`
- [ ] Можно получить JWT токен для админа
- [ ] Endpoint `/api/products` возвращает товары
- [ ] Можно просмотреть каталог в боте
- [ ] Можно оформить заказ через бота

### Тестовые запросы

```bash
# 1. Получить токен
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  | jq -r '.access_token')

# 2. Получить все товары (admin)
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/admin/products

# 3. Создать новый товар
curl -X POST http://localhost:3000/api/admin/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "description": "This is a test product",
    "category_id": 1,
    "is_active": true
  }'

# 4. Получить заказы
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/admin/orders
```

---

## 🛑 Остановка и управление

### Docker Compose

```bash
# Остановить все сервисы
docker-compose stop

# Остановить и удалить контейнеры
docker-compose down

# Остановить и удалить контейнеры + volumes (БД будет удалена!)
docker-compose down -v

# Перезапустить сервисы
docker-compose restart

# Перезапустить конкретный сервис
docker-compose restart api
docker-compose restart bot

# Просмотр логов
docker-compose logs -f
docker-compose logs -f api
docker-compose logs -f bot

# Статус сервисов
docker-compose ps

# Обновление после изменений
docker-compose up -d --build
```

### PM2

```bash
# Остановить
pm2 stop telegram-shop-api
pm2 stop telegram-shop-bot

# Перезапустить
pm2 restart telegram-shop-api
pm2 restart telegram-shop-bot

# Удалить
pm2 delete telegram-shop-api
pm2 delete telegram-shop-bot

# Просмотр всех процессов
pm2 list

# Мониторинг в реальном времени
pm2 monit

# Логи
pm2 logs telegram-shop-api
pm2 logs telegram-shop-bot
```

---

## 🔧 Обновление проекта

```bash
# Остановить сервисы
docker-compose down

# Удалить старые образы
docker-compose rm -f

# Пересобрать и запустить
docker-compose up -d --build

# Проверить логи
docker-compose logs -f
```

---

## 📚 Дополнительные ресурсы

- [ARCHITECTURE.md](./ARCHITECTURE.md) - архитектура проекта
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - описание API endpoints
- [BOT_LOGIC.md](./BOT_LOGIC.md) - логика работы бота
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - решение проблем
- [DEVELOPMENT.md](./DEVELOPMENT.md) - руководство разработчика

---

**Обновлено:** 2025-12-04  
**Версия:** 1.0.0
