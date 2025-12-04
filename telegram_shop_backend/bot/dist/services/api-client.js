"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiClient = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../config");
const logger_1 = require("../utils/logger");
/**
 * API Client for backend communication
 */
class ApiClient {
    constructor() {
        this.client = axios_1.default.create({
            baseURL: config_1.config.apiBaseUrl,
            timeout: config_1.config.apiTimeout,
            headers: {
                'Content-Type': 'application/json',
            },
        });
        // Request interceptor
        this.client.interceptors.request.use((config) => {
            logger_1.logger.debug('API Request:', { url: config.url, method: config.method });
            return config;
        }, (error) => {
            logger_1.logger.error('API Request Error:', error);
            return Promise.reject(error);
        });
        // Response interceptor
        this.client.interceptors.response.use((response) => {
            logger_1.logger.debug('API Response:', { url: response.config.url, status: response.status });
            return response;
        }, (error) => {
            logger_1.logger.error('API Response Error:', {
                url: error.config?.url,
                status: error.response?.status,
                message: error.message,
            });
            return Promise.reject(error);
        });
    }
    /**
     * Get products list with pagination and filters
     */
    async getProducts(page = 1, limit = 10, search) {
        const response = await this.client.get('/products', {
            params: { page, limit, search },
        });
        return response.data;
    }
    /**
     * Get product by ID
     */
    async getProduct(id) {
        const response = await this.client.get(`/products/${id}`);
        return response.data;
    }
    /**
     * Create or update user
     */
    async upsertUser(userData) {
        const response = await this.client.post('/users/upsert', userData);
        return response.data;
    }
    /**
     * Get user by Telegram ID
     */
    async getUserByTelegramId(telegramId) {
        try {
            const response = await this.client.get(`/users/telegram/${telegramId}`);
            return response.data;
        }
        catch (error) {
            if (error.response?.status === 404) {
                return null;
            }
            throw error;
        }
    }
    /**
     * Create order
     */
    async createOrder(orderData) {
        const response = await this.client.post('/orders', orderData);
        return response.data;
    }
    /**
     * Get user orders
     */
    async getUserOrders(userId, page = 1, limit = 10) {
        const response = await this.client.get('/orders', {
            params: { userId, page, limit },
        });
        return response.data;
    }
    /**
     * Get order by ID
     */
    async getOrder(orderId) {
        const response = await this.client.get(`/orders/${orderId}`);
        return response.data;
    }
}
exports.apiClient = new ApiClient();
//# sourceMappingURL=api-client.js.map