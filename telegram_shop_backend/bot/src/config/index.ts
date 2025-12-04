import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Bot configuration
  botToken: process.env.BOT_TOKEN || '',
  
  // API configuration
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3000/api',
  apiTimeout: parseInt(process.env.API_TIMEOUT || '10000', 10),
  
  // Admin configuration
  adminTelegramIds: (process.env.ADMIN_TELEGRAM_IDS || '')
    .split(',')
    .map(id => parseInt(id.trim(), 10))
    .filter(id => !isNaN(id)),
  
  // Environment
  nodeEnv: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',
  
  // Session configuration
  sessionTtl: parseInt(process.env.SESSION_TTL || '3600', 10),
  
  // Pagination
  productsPerPage: 5,
  ordersPerPage: 5,
} as const;

// Validate required config
if (!config.botToken) {
  throw new Error('BOT_TOKEN is required');
}

if (!config.apiBaseUrl) {
  throw new Error('API_BASE_URL is required');
}
