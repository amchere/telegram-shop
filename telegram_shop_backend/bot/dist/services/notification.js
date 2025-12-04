"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifyUser = notifyUser;
exports.notifyAdmins = notifyAdmins;
exports.sendOrderConfirmation = sendOrderConfirmation;
const config_1 = require("../config");
const logger_1 = require("../utils/logger");
const formatters_1 = require("../utils/formatters");
/**
 * Send notification to user about order status
 */
async function notifyUser(api, userId, message) {
    try {
        await api.sendMessage(userId, message, { parse_mode: 'Markdown' });
        logger_1.logger.info('User notification sent:', { userId });
    }
    catch (error) {
        logger_1.logger.error('Failed to send user notification:', { userId, error });
    }
}
/**
 * Send notification to admins about new order
 */
async function notifyAdmins(api, order) {
    const message = `🆕 **Новый заказ #${order.id}**\n\n${(0, formatters_1.formatOrderSummary)(order)}`;
    for (const adminId of config_1.config.adminTelegramIds) {
        try {
            await api.sendMessage(adminId, message, { parse_mode: 'Markdown' });
            logger_1.logger.info('Admin notification sent:', { adminId, orderId: order.id });
        }
        catch (error) {
            logger_1.logger.error('Failed to send admin notification:', { adminId, orderId: order.id, error });
        }
    }
}
/**
 * Send order confirmation to user
 */
async function sendOrderConfirmation(api, userId, order) {
    const message = `✅ **Заказ успешно оформлен!**\n\n` +
        `Номер заказа: #${order.id}\n` +
        `Статус: ${order.status}\n\n` +
        `${(0, formatters_1.formatOrderSummary)(order)}` +
        `Мы свяжемся с вами для подтверждения заказа.\n\n` +
        `Спасибо за покупку! 🎉`;
    await notifyUser(api, userId, message);
}
//# sourceMappingURL=notification.js.map