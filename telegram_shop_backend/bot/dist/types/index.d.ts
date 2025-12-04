import type { Context } from 'grammy';
import type { ConversationFlavor } from '@grammyjs/conversations';
export interface UserData {
    id: number;
    telegramId: number;
    username?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
}
export interface Product {
    id: number;
    name: string;
    description: string;
    sku: string;
    price: number;
    images: string[];
    weight?: number;
    dimensions?: string;
    isActive: boolean;
    variants?: ProductVariant[];
}
export interface ProductVariant {
    id: number;
    productId: number;
    name: string;
    sku: string;
    priceModifier: number;
    stockQuantity: number;
    attributes: Record<string, string>;
}
export interface Order {
    id: number;
    userId: number;
    status: OrderStatus;
    totalAmount: number;
    shippingAddress: string;
    notes?: string;
    items: OrderItem[];
    createdAt: string;
    updatedAt: string;
}
export interface OrderItem {
    id: number;
    productId: number;
    variantId?: number;
    quantity: number;
    price: number;
    subtotal: number;
}
export declare enum OrderStatus {
    PENDING = "pending",
    CONFIRMED = "confirmed",
    PROCESSING = "processing",
    SHIPPED = "shipped",
    DELIVERED = "delivered",
    CANCELLED = "cancelled"
}
export interface SessionData {
    conversationData: Record<string, any>;
    userData: UserData | null;
    currentProduct: Product | null;
    orderData: {
        productId?: number;
        variantId?: number;
        quantity?: number;
        shippingAddress?: string;
        phone?: string;
        notes?: string;
    } | null;
}
export type BotContext = Context & ConversationFlavor<Context> & {
    session: SessionData;
};
//# sourceMappingURL=index.d.ts.map