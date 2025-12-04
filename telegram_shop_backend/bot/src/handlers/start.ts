import { Bot, InlineKeyboard } from 'grammy';
import type { BotContext } from '../types';
import { logger } from '../utils/logger';

/**
 * /start command handler
 */
export function registerStartHandler(bot: Bot<BotContext>) {
  bot.command('start', async (ctx) => {
    logger.info('Start command received:', { userId: ctx.from?.id });

    const userName = ctx.from?.first_name || 'Гость';

    const welcomeText = `👋 Привет, ${userName}!\n\n` +
      `Добро пожаловать в наш магазин! 🛍\n\n` +
      `Здесь вы можете:\n` +
      `• Просмотреть каталог товаров\n` +
      `• Оформить заказ\n` +
      `• Просмотреть историю заказов\n\n` +
      `Выберите действие:`;

    const keyboard = new InlineKeyboard()
      .text('📚 Каталог', 'catalog:page:1')
      .row()
      .text('📄 Мои заказы', 'orders:page:1')
      .row()
      .text('👤 Профиль', 'profile')
      .row()
      .text('ℹ️ Помощь', 'help');

    await ctx.reply(welcomeText, { reply_markup: keyboard });
  });

  // Help callback
  bot.callbackQuery('help', async (ctx) => {
    await ctx.answerCallbackQuery();

    const helpText = `🔧 **Помощь**\n\n` +
      `Доступные команды:\n` +
      `/start - Главное меню\n` +
      `/catalog - Просмотр каталога\n` +
      `/orders - Мои заказы\n` +
      `/profile - Мой профиль\n\n` +
      `По вопросам обращайтесь к нашей поддержке. ❤️`;

    const keyboard = new InlineKeyboard().text('← Назад в меню', 'back:menu');

    await ctx.editMessageText(helpText, {
      parse_mode: 'Markdown',
      reply_markup: keyboard,
    });
  });

  // Back to menu callback
  bot.callbackQuery('back:menu', async (ctx) => {
    await ctx.answerCallbackQuery();

    const userName = ctx.from?.first_name || 'Гость';

    const welcomeText = `👋 Привет, ${userName}!\n\n` +
      `Выберите действие:`;

    const keyboard = new InlineKeyboard()
      .text('📚 Каталог', 'catalog:page:1')
      .row()
      .text('📄 Мои заказы', 'orders:page:1')
      .row()
      .text('👤 Профиль', 'profile')
      .row()
      .text('ℹ️ Помощь', 'help');

    await ctx.editMessageText(welcomeText, { reply_markup: keyboard });
  });
}
