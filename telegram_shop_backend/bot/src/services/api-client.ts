import axios, { AxiosInstance } from 'axios';
import { config } from '../config';
import { logger } from '../utils/logger';
import type { Product, Order, UserData } from '../types';

/**
 * API Client for backend communication
 */
class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.apiBaseUrl,
      timeout: config.apiTimeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        logger.debug('API Request:', { url: config.url, method: config.method });
        return config;
      },
      (error) => {
        logger.error('API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        logger.debug('API Response:', { url: response.config.url, status: response.status });
        return response;
      },
      (error) => {
        logger.error('API Response Error:', {
          url: error.config?.url,
          status: error.response?.status,
          message: error.message,
        });
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get products list with pagination and filters
   */
  async getProducts(page: number = 1, limit: number = 10, search?: string): Promise<{ data: Product[], total: number }> {
    const response = await this.client.get('/products', {
      params: { page, limit, search },
    });
    return response.data;
  }

  /**
   * Get product by ID
   */
  async getProduct(id: number): Promise<Product> {
    const response = await this.client.get(`/products/${id}`);
    return response.data;
  }

  /**
   * Create or update user
   */
  async upsertUser(userData: Partial<UserData>): Promise<UserData> {
    const response = await this.client.post('/users/upsert', userData);
    return response.data;
  }

  /**
   * Get user by Telegram ID
   */
  async getUserByTelegramId(telegramId: number): Promise<UserData | null> {
    try {
      const response = await this.client.get(`/users/telegram/${telegramId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Create order
   */
  async createOrder(orderData: any): Promise<Order> {
    const response = await this.client.post('/orders', orderData);
    return response.data;
  }

  /**
   * Get user orders
   */
  async getUserOrders(userId: number, page: number = 1, limit: number = 10): Promise<{ data: Order[], total: number }> {
    const response = await this.client.get('/orders', {
      params: { userId, page, limit },
    });
    return response.data;
  }

  /**
   * Get order by ID
   */
  async getOrder(orderId: number): Promise<Order> {
    const response = await this.client.get(`/orders/${orderId}`);
    return response.data;
  }
}

export const apiClient = new ApiClient();
