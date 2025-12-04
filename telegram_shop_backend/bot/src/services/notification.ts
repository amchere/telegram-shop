import type { Api } from 'grammy';
import { config } from '../config';
import { logger } from '../utils/logger';
import { formatOrderSummary } from '../utils/formatters';
import type { Order } from '../types';

/**
 * Send notification to user about order status
 */
export async function notifyUser(
  api: Api,
  userId: number,
  message: string
): Promise<void> {
  try {
    await api.sendMessage(userId, message, { parse_mode: 'Markdown' });
    logger.info('User notification sent:', { userId });
  } catch (error) {
    logger.error('Failed to send user notification:', { userId, error });
  }
}

/**
 * Send notification to admins about new order
 */
export async function notifyAdmins(
  api: Api,
  order: Order
): Promise<void> {
  const message = `🆕 **Новый заказ #${order.id}**\n\n${formatOrderSummary(order)}`;

  for (const adminId of config.adminTelegramIds) {
    try {
      await api.sendMessage(adminId, message, { parse_mode: 'Markdown' });
      logger.info('Admin notification sent:', { adminId, orderId: order.id });
    } catch (error) {
      logger.error('Failed to send admin notification:', { adminId, orderId: order.id, error });
    }
  }
}

/**
 * Send order confirmation to user
 */
export async function sendOrderConfirmation(
  api: Api,
  userId: number,
  order: Order
): Promise<void> {
  const message = `✅ **Заказ успешно оформлен!**\n\n` +
    `Номер заказа: #${order.id}\n` +
    `Статус: ${order.status}\n\n` +
    `${formatOrderSummary(order)}` +
    `Мы свяжемся с вами для подтверждения заказа.\n\n` +
    `Спасибо за покупку! 🎉`;

  await notifyUser(api, userId, message);
}
