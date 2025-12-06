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

#Проверить, сколько у сервера памяти и свапа
На сервере:
```bash
Copy
free -h
swapon --show
```
С большой вероятностью у тебя:
1 ГБ или 2 ГБ RAM;
и нет/мало swap.
Сборка Nest/TypeScript с yarn build + Docker buildx легко вылезает за 1–2 ГБ.
Добавить swap (рекомендую минимум 2 ГБ)
Если swap отсутствует (swapon --show ничего не выводит), создай:

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```
Проверка:

```bash
swapon --show
free -h
```

Чтобы swap включался после перезагрузки:
```bash
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

```bash
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
#для слабых машин < RAM 2G
sudo sysctl vm.swappiness=80
```

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
        server_name <ВСТАВИТЬ IP>;
    
        location /api {
            proxy_pass http://localhost:3001;  # API контейнер проброшен на 3001
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
            proxy_pass http://localhost:3001/api-docs;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
        }
    
        # корень, чтобы не было пустой страницы
        location / {
            return 200 'OK';
            add_header Content-Type text/plain;
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

# включаем сайт
sudo ln -s /etc/nginx/sites-available/telegram-shop /etc/nginx/sites-enabled/telegram-shop 2>/dev/null || true

# можно удалить дефолтный, чтобы не мешался
sudo rm -f /etc/nginx/sites-enabled/default

# проверка синтаксиса
sudo nginx -t

# перезапуск
sudo systemctl restart nginx
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
### 2.1 Если нет пользователя 

```bash
Всё ясно: таблица admin_users пустая, поэтому логин admin/admin123 и не работает — просто нет ни одного админа.

Нужно создать администратора. Для этого надо знать, как API хэширует пароли (bcrypt, argon2 и т.п.), но в 99% таких шаблонов — это bcrypt.

Сделаем так:

На хосте сгенерируем bcrypt‑хэш для пароля admin123.
Вставим запись в admin_users с этим хэшем.
1. Сгенерировать bcrypt‑хэш пароля admin123
Самый простой способ — через node в контейнере api:

bash
Copy
docker exec -it telegram_shop_api sh -c "node -e \"const bcrypt = require('bcrypt'); bcrypt.hash('admin123', 10).then(h => console.log(h));\""
Эта команда выведет строку типа:

text
Copy
$2b$10$Q3l3.... (длинный bcrypt-хэш)
Скопируй этот хэш целиком.

Если команда упадёт с ошибкой Cannot find module 'bcrypt', пришли ошибку — подскажу обходной вариант (через npx bcrypt-cli или встроенную утилиту).

2. Вставить админа в admin_users
Вернись в psql:

bash
Copy
docker exec -it telegram_shop_db psql -U postgres -d telegram_shop
И выполни (подставь свой хэш вместо <ХЭШ_ОТСЮДА>):

sql
Copy
INSERT INTO admin_users (username, email, password_hash, role, is_active)
VALUES ('admin', 'admin@example.com', '<ХЭШ_ОТСЮДА>', 'admin', true);
Проверим:

sql
Copy
SELECT id, username, email, role, is_active, created_at
FROM admin_users;
Должна появиться строка с admin.

3. Проверить логин ещё раз
С хоста:

bash
Copy
curl -X POST http://localhost:3001/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
Если всё ок, получишь что‑то вроде:

json
Copy
{
  "access_token": "....",
  "expires_in": ...
}
Если вернётся снова Incorrect username or password, скинь:

Ответ целиком curl .../auth/token.
Логи API:
bash
Copy
docker-compose logs --tail=100 api

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

# Установить jq
```bash   
sudo apt update
sudo apt install jq -y
```

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
## исправление в создании товара
```bash
1. Создаём категорию в БД
bash
Copy
docker exec -it telegram_shop_db psql -U postgres -d telegram_shop
Внутри psql:

sql
Copy
INSERT INTO categories (name, parent_id)
VALUES ('Default Category', NULL);

SELECT id, name FROM categories ORDER BY id;
Запомни id (скорее всего будет 1).

Выйти:

sql
Copy
\q
2. Создаём товар через API с этим category_id
Подставь реальный ID категории:

bash
Copy
CATEGORY_ID=1  # если в SELECT выше другой id — поставь его

curl -X POST http://localhost:3001/api/admin/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Test Product\",
    \"description\": \"This is a test product\",
    \"category_id\": $CATEGORY_ID,
    \"is_active\": true,
    \"variants\": [
      {
        \"sku\": \"TEST-001\",
        \"price\": 1000,
        \"stock_quantity\": 10,
        \"attributes\": [],
        \"images\": []
      }
    ]
  }"
Если всё ок — вернётся JSON созданного продукта.
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
