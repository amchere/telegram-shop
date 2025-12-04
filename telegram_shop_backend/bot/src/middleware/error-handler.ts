import { BotError } from 'grammy';
import { logger } from '../utils/logger';
import type { BotContext } from '../types';

/**
 * Global error handler middleware
 */
export async function errorHandler(ctx: BotContext, next: () => Promise<void>) {
  try {
    await next();
  } catch (error) {
    logger.error('Bot error:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      updateId: ctx.update.update_id,
      userId: ctx.from?.id,
    });

    // Send user-friendly error message
    try {
      await ctx.reply(
        '❌ Произошла ошибка. Пожалуйста, попробуйте позже или обратитесь в поддержку.'
      );
    } catch (replyError) {
      logger.error('Failed to send error message to user:', replyError);
    }

    // Re-throw if it's a BotError to be handled by Grammy
    if (error instanceof BotError) {
      throw error;
    }
  }
}
