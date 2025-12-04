"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderConversation = orderConversation;
const grammy_1 = require("grammy");
const api_client_1 = require("../services/api-client");
const logger_1 = require("../utils/logger");
const formatters_1 = require("../utils/formatters");
const notification_1 = require("../services/notification");
/**
 * Order conversation flow
 */
async function orderConversation(conversation, ctx) {
    try {
        const orderData = ctx.session.orderData;
        if (!orderData || !orderData.productId) {
            await ctx.reply('❌ Ошибка: товар не выбран.');
            return;
        }
        // Get product details
        const product = await api_client_1.apiClient.getProduct(orderData.productId);
        const variant = orderData.variantId
            ? product.variants?.find((v) => v.id === orderData.variantId)
            : undefined;
        // Step 1: Confirm product
        await ctx.reply(`🛍 **Оформление заказа**\n\n${(0, formatters_1.formatProduct)(product, variant)}`, { parse_mode: 'Markdown' });
        // Step 2: Get quantity
        await ctx.reply('🔢 Введите количество (или нажмите /cancel для отмены):');
        const quantityResponse = await conversation.wait();
        if (quantityResponse.message?.text === '/cancel') {
            await ctx.reply('❌ Оформление заказа отменено.');
            return;
        }
        const quantity = parseInt(quantityResponse.message?.text || '1', 10);
        if (isNaN(quantity) || quantity < 1) {
            await ctx.reply('❌ Некорректное количество. Оформление отменено.');
            return;
        }
        orderData.quantity = quantity;
        // Step 3: Get phone number
        const user = ctx.session.userData;
        let phone = user?.phone;
        if (!phone) {
            const phoneKeyboard = new grammy_1.InlineKeyboard()
                .text('📞 Поделиться контактом', 'share:contact')
                .row()
                .text('❌ Отмена', 'cancel:order');
            await ctx.reply('📞 Введите номер телефона для связи (в формате +79991234567):', { reply_markup: phoneKeyboard });
            const phoneResponse = await conversation.wait();
            if (phoneResponse.callbackQuery?.data === 'cancel:order') {
                await ctx.reply('❌ Оформление заказа отменено.');
                return;
            }
            phone = phoneResponse.message?.contact?.phone_number || phoneResponse.message?.text;
            if (!phone) {
                await ctx.reply('❌ Номер телефона не указан. Оформление отменено.');
                return;
            }
            orderData.phone = phone;
        }
        // Step 4: Get shipping address
        await ctx.reply('📍 Введите адрес доставки:');
        const addressResponse = await conversation.wait();
        const address = addressResponse.message?.text;
        if (!address || address === '/cancel') {
            await ctx.reply('❌ Оформление заказа отменено.');
            return;
        }
        orderData.shippingAddress = address;
        // Step 5: Get notes (optional)
        await ctx.reply('📝 Добавьте примечания к заказу (или /skip чтобы пропустить):');
        const notesResponse = await conversation.wait();
        const notes = notesResponse.message?.text;
        if (notes && notes !== '/skip') {
            orderData.notes = notes;
        }
        // Step 6: Calculate total
        const basePrice = variant ? product.price + variant.priceModifier : product.price;
        const totalAmount = basePrice * quantity;
        // Step 7: Confirmation
        const confirmText = `📋 **Подтвердите заказ**\n\n` +
            `Товар: ${product.name}\n` +
            (variant ? `Вариант: ${variant.name}\n` : '') +
            `Количество: ${quantity} шт.\n` +
            `Цена: ${(0, formatters_1.formatPrice)(basePrice)} x ${quantity} = ${(0, formatters_1.formatPrice)(totalAmount)}\n\n` +
            `📞 Телефон: ${phone}\n` +
            `📍 Адрес: ${address}\n` +
            (notes ? `📝 Примечания: ${notes}\n` : '') +
            `\n💰 **Итого: ${(0, formatters_1.formatPrice)(totalAmount)}**`;
        const confirmKeyboard = new grammy_1.InlineKeyboard()
            .text('✅ Подтвердить', 'confirm:order')
            .row()
            .text('❌ Отменить', 'cancel:order');
        await ctx.reply(confirmText, {
            parse_mode: 'Markdown',
            reply_markup: confirmKeyboard,
        });
        const confirmResponse = await conversation.wait();
        if (confirmResponse.callbackQuery?.data !== 'confirm:order') {
            await ctx.reply('❌ Оформление заказа отменено.');
            return;
        }
        // Step 8: Create order
        await ctx.reply('⏳ Создание заказа...');
        try {
            const order = await api_client_1.apiClient.createOrder({
                userId: user?.id,
                items: [
                    {
                        productId: orderData.productId,
                        variantId: orderData.variantId,
                        quantity: orderData.quantity,
                        price: basePrice,
                        subtotal: totalAmount,
                    },
                ],
                totalAmount,
                shippingAddress: orderData.shippingAddress,
                notes: orderData.notes,
                phone: orderData.phone,
            });
            logger_1.logger.info('Order created:', { orderId: order.id, userId: user?.id });
            // Send confirmation to user
            await (0, notification_1.sendOrderConfirmation)(ctx.api, ctx.from.id, order);
            // Notify admins
            await (0, notification_1.notifyAdmins)(ctx.api, order);
            // Clear order data
            ctx.session.orderData = null;
        }
        catch (error) {
            logger_1.logger.error('Failed to create order:', error);
            await ctx.reply('❌ Ошибка при создании заказа. Пожалуйста, попробуйте позже.');
        }
    }
    catch (error) {
        logger_1.logger.error('Order conversation error:', error);
        await ctx.reply('❌ Произошла ошибка. Пожалуйста, попробуйте снова.');
    }
}
//# sourceMappingURL=order.js.map