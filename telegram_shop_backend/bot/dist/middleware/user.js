"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userMiddleware = userMiddleware;
const api_client_1 = require("../services/api-client");
const logger_1 = require("../utils/logger");
/**
 * User middleware - ensures user exists in database
 */
async function userMiddleware(ctx, next) {
    if (!ctx.from) {
        await next();
        return;
    }
    try {
        // Get or create user
        let user = await api_client_1.apiClient.getUserByTelegramId(ctx.from.id);
        if (!user) {
            // Create new user
            user = await api_client_1.apiClient.upsertUser({
                telegramId: ctx.from.id,
                username: ctx.from.username,
                firstName: ctx.from.first_name,
                lastName: ctx.from.last_name,
            });
            logger_1.logger.info('New user created:', { userId: user.id, telegramId: ctx.from.id });
        }
        // Store user in session
        ctx.session.userData = user;
    }
    catch (error) {
        logger_1.logger.error('User middleware error:', {
            telegramId: ctx.from.id,
            error,
        });
    }
    await next();
}
//# sourceMappingURL=user.js.map