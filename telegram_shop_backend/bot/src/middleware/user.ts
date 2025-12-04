import { apiClient } from '../services/api-client';
import { logger } from '../utils/logger';
import type { BotContext } from '../types';

/**
 * User middleware - ensures user exists in database
 */
export async function userMiddleware(ctx: BotContext, next: () => Promise<void>) {
  if (!ctx.from) {
    await next();
    return;
  }

  try {
    // Get or create user
    let user = await apiClient.getUserByTelegramId(ctx.from.id);
    
    if (!user) {
      // Create new user
      const full_name = [ctx.from.first_name, ctx.from.last_name]
        .filter(Boolean)
        .join(' ') || 'Unknown';
      
      user = await apiClient.upsertUser({
        telegram_id: ctx.from.id,
        username: ctx.from.username,
        full_name,
      });
      logger.info('New user created:', { userId: user.id, telegram_id: ctx.from.id });
    }

    // Store user in session
    ctx.session.userData = user;
  } catch (error) {
    logger.error('User middleware error:', {
      telegramId: ctx.from.id,
      error,
    });
  }

  await next();
}
