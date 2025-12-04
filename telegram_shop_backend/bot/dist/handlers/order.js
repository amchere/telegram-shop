"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerOrderHandlers = registerOrderHandlers;
/**
 * Register order handlers
 */
function registerOrderHandlers(bot) {
    // Start order conversation
    bot.callbackQuery(/^order:product:(\d+)$/, async (ctx) => {
        await ctx.answerCallbackQuery();
        const productId = parseInt(ctx.match[1], 10);
        ctx.session.orderData = {
            productId,
            quantity: 1,
        };
        await ctx.conversation.enter('orderConversation');
    });
    bot.callbackQuery(/^order:variant:(\d+):(\d+)$/, async (ctx) => {
        await ctx.answerCallbackQuery();
        const productId = parseInt(ctx.match[1], 10);
        const variantId = parseInt(ctx.match[2], 10);
        ctx.session.orderData = {
            productId,
            variantId,
            quantity: 1,
        };
        await ctx.conversation.enter('orderConversation');
    });
    // My orders command
    bot.command('orders', async (ctx) => {
        await ctx.reply('📄 Загрузка заказов...');
        // Will be implemented with API integration
    });
    bot.callbackQuery(/^orders:page:(\d+)$/, async (ctx) => {
        await ctx.answerCallbackQuery();
        await ctx.reply('📄 Функция просмотра заказов будет доступна скоро.');
    });
}
//# sourceMappingURL=order.js.map