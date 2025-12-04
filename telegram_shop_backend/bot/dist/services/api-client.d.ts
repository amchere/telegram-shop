import type { Product, Order, UserData } from '../types';
/**
 * API Client for backend communication
 */
declare class ApiClient {
    private client;
    constructor();
    /**
     * Get products list with pagination and filters
     */
    getProducts(page?: number, limit?: number, search?: string): Promise<{
        data: Product[];
        total: number;
    }>;
    /**
     * Get product by ID
     */
    getProduct(id: number): Promise<Product>;
    /**
     * Create or update user
     */
    upsertUser(userData: Partial<UserData>): Promise<UserData>;
    /**
     * Get user by Telegram ID
     */
    getUserByTelegramId(telegramId: number): Promise<UserData | null>;
    /**
     * Create order
     */
    createOrder(orderData: any): Promise<Order>;
    /**
     * Get user orders
     */
    getUserOrders(userId: number, page?: number, limit?: number): Promise<{
        data: Order[];
        total: number;
    }>;
    /**
     * Get order by ID
     */
    getOrder(orderId: number): Promise<Order>;
}
export declare const apiClient: ApiClient;
export {};
//# sourceMappingURL=api-client.d.ts.map