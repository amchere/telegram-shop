"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
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
};
// Validate required config
if (!exports.config.botToken) {
    throw new Error('BOT_TOKEN is required');
}
if (!exports.config.apiBaseUrl) {
    throw new Error('API_BASE_URL is required');
}
//# sourceMappingURL=index.js.map