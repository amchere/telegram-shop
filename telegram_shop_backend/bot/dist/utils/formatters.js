"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatPrice = formatPrice;
exports.formatProduct = formatProduct;
exports.formatOrderSummary = formatOrderSummary;
exports.formatOrderStatus = formatOrderStatus;
exports.truncate = truncate;
exports.escapeMarkdown = escapeMarkdown;
/**
 * Format price for display
 */
function formatPrice(price) {
    return `${price.toFixed(2)} ₽`;
}
/**
 * Format product details for display
 */
function formatProduct(product, variant) {
    let text = `📦 **${product.name}**\n\n`;
    text += `${product.description}\n\n`;
    if (variant) {
        text += `📋 Вариант: ${variant.name}\n`;
        text += `SKU: ${variant.sku}\n`;
        const finalPrice = product.price + variant.priceModifier;
        text += `💰 Цена: ${formatPrice(finalPrice)}\n`;
        text += `📊 В наличии: ${variant.stockQuantity} шт.\n\n`;
    }
    else {
        text += `SKU: ${product.sku}\n`;
        text += `💰 Цена: ${formatPrice(product.price)}\n\n`;
    }
    if (product.weight) {
        text += `⚖️ Вес: ${product.weight} г\n`;
    }
    if (product.dimensions) {
        text += `📏 Размеры: ${product.dimensions}\n`;
    }
    return text;
}
/**
 * Format order summary for display
 */
function formatOrderSummary(order) {
    let text = `📋 **Ваш заказ**\n\n`;
    if (order.items && order.items.length > 0) {
        order.items.forEach((item, index) => {
            text += `${index + 1}. Товар #${item.productId}`;
            if (item.variantId) {
                text += ` (вариант #${item.variantId})`;
            }
            text += `\n   Количество: ${item.quantity} шт.\n`;
            text += `   Цена: ${formatPrice(item.subtotal)}\n\n`;
        });
    }
    if (order.totalAmount) {
        text += `💰 **Итого: ${formatPrice(order.totalAmount)}**\n\n`;
    }
    if (order.shippingAddress) {
        text += `📍 Адрес доставки: ${order.shippingAddress}\n\n`;
    }
    if (order.notes) {
        text += `📝 Примечания: ${order.notes}\n\n`;
    }
    return text;
}
/**
 * Format order status for display
 */
function formatOrderStatus(status) {
    const statusMap = {
        pending: '⏳ Ожидает подтверждения',
        confirmed: '✅ Подтвержден',
        processing: '📦 В обработке',
        shipped: '🚚 Отправлен',
        delivered: '✨ Доставлен',
        cancelled: '❌ Отменен',
    };
    return statusMap[status] || status;
}
/**
 * Truncate text to specified length
 */
function truncate(text, maxLength) {
    if (text.length <= maxLength)
        return text;
    return text.substring(0, maxLength - 3) + '...';
}
/**
 * Escape markdown special characters
 */
function escapeMarkdown(text) {
    return text.replace(/([_*\[\]()~`>#+\-=|{}.!])/g, '\\$1');
}
//# sourceMappingURL=formatters.js.map