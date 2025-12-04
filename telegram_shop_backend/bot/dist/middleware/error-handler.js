"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const grammy_1 = require("grammy");
const logger_1 = require("../utils/logger");
/**
 * Global error handler middleware
 */
async function errorHandler(ctx, next) {
    try {
        await next();
    }
    catch (error) {
        logger_1.logger.error('Bot error:', {
            error: error instanceof Error ? error.message : error,
            stack: error instanceof Error ? error.stack : undefined,
            updateId: ctx.update.update_id,
            userId: ctx.from?.id,
        });
        // Send user-friendly error message
        try {
            await ctx.reply('❌ Произошла ошибка. Пожалуйста, попробуйте позже или обратитесь в поддержку.');
        }
        catch (replyError) {
            logger_1.logger.error('Failed to send error message to user:', replyError);
        }
        // Re-throw if it's a BotError to be handled by Grammy
        if (error instanceof grammy_1.BotError) {
            throw error;
        }
    }
}
//# sourceMappingURL=error-handler.js.map