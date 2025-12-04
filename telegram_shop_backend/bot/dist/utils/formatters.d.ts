import type { Product, ProductVariant, Order } from '../types';
/**
 * Format price for display
 */
export declare function formatPrice(price: number): string;
/**
 * Format product details for display
 */
export declare function formatProduct(product: Product, variant?: ProductVariant): string;
/**
 * Format order summary for display
 */
export declare function formatOrderSummary(order: Partial<Order>): string;
/**
 * Format order status for display
 */
export declare function formatOrderStatus(status: string): string;
/**
 * Truncate text to specified length
 */
export declare function truncate(text: string, maxLength: number): string;
/**
 * Escape markdown special characters
 */
export declare function escapeMarkdown(text: string): string;
//# sourceMappingURL=formatters.d.ts.map