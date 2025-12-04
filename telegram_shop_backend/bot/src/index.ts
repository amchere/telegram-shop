import { Bot, session } from 'grammy';
import { conversations, createConversation } from '@grammyjs/conversations';
import { config } from './config';
import { logger } from './utils/logger';

// Handlers
import { registerStartHandler } from './handlers/start';
import { registerCatalogHandlers } from './handlers/catalog';
import { registerOrderHandlers } from './handlers/order';
import { registerProfileHandlers } from './handlers/profile';

// Middleware
import { errorHandler } from './middleware/error-handler';
import { loggingMiddleware } from './middleware/logging';
import { userMiddleware } from './middleware/user';

// Conversations
import { orderConversation } from './conversations/order';

// Types
import type { BotContext, SessionData } from './types';

/**
 * Main bot initialization and startup
 */
async function main() {
  try {
    logger.info('Starting Telegram Shop Bot...');

    // Initialize bot
    const bot = new Bot<BotContext>(config.botToken);

    // Install session and conversations
    bot.use(session({
      initial(): SessionData {
        return {
          conversationData: {},
          userData: null,
          currentProduct: null,
          orderData: null,
        };
      },
    }));

    bot.use(conversations());
    bot.use(createConversation(orderConversation));

    // Install middleware
    bot.use(loggingMiddleware);
    bot.use(userMiddleware);
    bot.use(errorHandler);

    // Register handlers
    registerStartHandler(bot);
    registerCatalogHandlers(bot);
    registerOrderHandlers(bot);
    registerProfileHandlers(bot);

    // Error handling
    bot.catch((err) => {
      logger.error('Bot error:', err);
    });

    // Start bot
    logger.info('Bot starting with polling...');
    await bot.start({
      onStart: (botInfo) => {
        logger.info(`Bot @${botInfo.username} is up and running!`);
      },
    });

    // Graceful shutdown
    process.once('SIGINT', () => {
      logger.info('SIGINT received, stopping bot...');
      bot.stop();
    });
    process.once('SIGTERM', () => {
      logger.info('SIGTERM received, stopping bot...');
      bot.stop();
    });

  } catch (error) {
    logger.error('Failed to start bot:', error);
    process.exit(1);
  }
}

// Start the bot
main();
