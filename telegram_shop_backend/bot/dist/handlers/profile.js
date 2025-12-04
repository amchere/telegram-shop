"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerProfileHandlers = registerProfileHandlers;
const grammy_1 = require("grammy");
/**
 * Register profile handlers
 */
function registerProfileHandlers(bot) {
    // Profile command
    bot.command('profile', async (ctx) => {
        await showProfile(ctx);
    });
    bot.callbackQuery('profile', async (ctx) => {
        await ctx.answerCallbackQuery();
        await showProfile(ctx);
    });
}
/**
 * Show user profile
 */
async function showProfile(ctx) {
    const user = ctx.session.userData;
    if (!user) {
        await ctx.reply('❌ Профиль не найден.');
        return;
    }
    let text = `👤 **Мой профиль**\n\n`;
    text += `Имя: ${user.firstName || 'Не указано'}\n`;
    if (user.lastName)
        text += `Фамилия: ${user.lastName}\n`;
    if (user.username)
        text += `Username: @${user.username}\n`;
    if (user.phone)
        text += `Телефон: ${user.phone}\n`;
    if (user.email)
        text += `Email: ${user.email}\n`;
    const keyboard = new grammy_1.InlineKeyboard()
        .text('📄 Мои заказы', 'orders:page:1')
        .row()
        .text('🏠 Главное меню', 'back:menu');
    if (ctx.callbackQuery) {
        await ctx.editMessageText(text, {
            parse_mode: 'Markdown',
            reply_markup: keyboard,
        });
    }
    else {
        await ctx.reply(text, {
            parse_mode: 'Markdown',
            reply_markup: keyboard,
        });
    }
}
//# sourceMappingURL=profile.js.map