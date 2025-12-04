import { logger } from '../utils/logger';
import type { BotContext } from '../types';

/**
 * Logging middleware
 */
export async function loggingMiddleware(ctx: BotContext, next: () => Promise<void>) {
  const start = Date.now();
  
  logger.info('Update received:', {
    updateId: ctx.update.update_id,
    userId: ctx.from?.id,
    username: ctx.from?.username,
    type: ctx.message ? 'message' : ctx.callbackQuery ? 'callback' : 'other',
    text: ctx.message?.text || ctx.callbackQuery?.data,
  });

  await next();

  const duration = Date.now() - start;
  logger.info('Update processed:', { updateId: ctx.update.update_id, duration });
}
