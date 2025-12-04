"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const grammy_1 = require("grammy");
const conversations_1 = require("@grammyjs/conversations");
const config_1 = require("./config");
const logger_1 = require("./utils/logger");
// Handlers
const start_1 = require("./handlers/start");
const catalog_1 = require("./handlers/catalog");
const order_1 = require("./handlers/order");
const profile_1 = require("./handlers/profile");
// Middleware
const error_handler_1 = require("./middleware/error-handler");
const logging_1 = require("./middleware/logging");
const user_1 = require("./middleware/user");
// Conversations
const order_2 = require("./conversations/order");
/**
 * Main bot initialization and startup
 */
async function main() {
    try {
        logger_1.logger.info('Starting Telegram Shop Bot...');
        // Initialize bot
        const bot = new grammy_1.Bot(config_1.config.botToken);
        // Install session and conversations
        bot.use((0, grammy_1.session)({
            initial() {
                return {
                    conversationData: {},
                    userData: null,
                    currentProduct: null,
                    orderData: null,
                };
            },
        }));
        bot.use((0, conversations_1.conversations)());
        bot.use((0, conversations_1.createConversation)(order_2.orderConversation));
        // Install middleware
        bot.use(logging_1.loggingMiddleware);
        bot.use(user_1.userMiddleware);
        bot.use(error_handler_1.errorHandler);
        // Register handlers
        (0, start_1.registerStartHandler)(bot);
        (0, catalog_1.registerCatalogHandlers)(bot);
        (0, order_1.registerOrderHandlers)(bot);
        (0, profile_1.registerProfileHandlers)(bot);
        // Error handling
        bot.catch((err) => {
            logger_1.logger.error('Bot error:', err);
        });
        // Start bot
        logger_1.logger.info('Bot starting with polling...');
        await bot.start({
            onStart: (botInfo) => {
                logger_1.logger.info(`Bot @${botInfo.username} is up and running!`);
            },
        });
        // Graceful shutdown
        process.once('SIGINT', () => {
            logger_1.logger.info('SIGINT received, stopping bot...');
            bot.stop();
        });
        process.once('SIGTERM', () => {
            logger_1.logger.info('SIGTERM received, stopping bot...');
            bot.stop();
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to start bot:', error);
        process.exit(1);
    }
}
// Start the bot
main();
//# sourceMappingURL=index.js.map