import type { Api } from 'grammy';
import type { Order } from '../types';
/**
 * Send notification to user about order status
 */
export declare function notifyUser(api: Api, userId: number, message: string): Promise<void>;
/**
 * Send notification to admins about new order
 */
export declare function notifyAdmins(api: Api, order: Order): Promise<void>;
/**
 * Send order confirmation to user
 */
export declare function sendOrderConfirmation(api: Api, userId: number, order: Order): Promise<void>;
//# sourceMappingURL=notification.d.ts.map