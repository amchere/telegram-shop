"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loggingMiddleware = loggingMiddleware;
const logger_1 = require("../utils/logger");
/**
 * Logging middleware
 */
async function loggingMiddleware(ctx, next) {
    const start = Date.now();
    logger_1.logger.info('Update received:', {
        updateId: ctx.update.update_id,
        userId: ctx.from?.id,
        username: ctx.from?.username,
        type: ctx.message ? 'message' : ctx.callbackQuery ? 'callback' : 'other',
        text: ctx.message?.text || ctx.callbackQuery?.data,
    });
    await next();
    const duration = Date.now() - start;
    logger_1.logger.info('Update processed:', { updateId: ctx.update.update_id, duration });
}
//# sourceMappingURL=logging.js.map