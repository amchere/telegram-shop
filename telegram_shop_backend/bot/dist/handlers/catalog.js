"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCatalogHandlers = registerCatalogHandlers;
const grammy_1 = require("grammy");
const logger_1 = require("../utils/logger");
const api_client_1 = require("../services/api-client");
const config_1 = require("../config");
const formatters_1 = require("../utils/formatters");
/**
 * Register catalog handlers
 */
function registerCatalogHandlers(bot) {
    // /catalog command
    bot.command('catalog', async (ctx) => {
        await showCatalogPage(ctx, 1);
    });
    // Catalog page navigation
    bot.callbackQuery(/^catalog:page:(\d+)$/, async (ctx) => {
        await ctx.answerCallbackQuery();
        const page = parseInt(ctx.match[1], 10);
        await showCatalogPage(ctx, page);
    });
    // Product details
    bot.callbackQuery(/^product:(\d+)$/, async (ctx) => {
        await ctx.answerCallbackQuery();
        const productId = parseInt(ctx.match[1], 10);
        await showProductDetails(ctx, productId);
    });
    // Product variant selection
    bot.callbackQuery(/^variant:(\d+):(\d+)$/, async (ctx) => {
        await ctx.answerCallbackQuery();
        const productId = parseInt(ctx.match[1], 10);
        const variantId = parseInt(ctx.match[2], 10);
        await showVariantDetails(ctx, productId, variantId);
    });
    // Back to catalog from product
    bot.callbackQuery(/^back:catalog:(\d+)$/, async (ctx) => {
        await ctx.answerCallbackQuery();
        const page = parseInt(ctx.match[1], 10);
        await showCatalogPage(ctx, page);
    });
    // Show variants list
    bot.callbackQuery(/^variants:(\d+)$/, async (ctx) => {
        await ctx.answerCallbackQuery();
        const productId = parseInt(ctx.match[1], 10);
        await showVariantsList(ctx, productId);
    });
}
/**
 * Show catalog page with products
 */
async function showCatalogPage(ctx, page) {
    try {
        const { data: products, total } = await api_client_1.apiClient.getProducts(page, config_1.config.productsPerPage);
        if (products.length === 0) {
            await ctx.reply('❌ Каталог пуст.');
            return;
        }
        const totalPages = Math.ceil(total / config_1.config.productsPerPage);
        let text = `📚 **Каталог товаров**\n\n`;
        text += `Страница ${page} из ${totalPages}\n`;
        text += `Всего товаров: ${total}\n\n`;
        const keyboard = new grammy_1.InlineKeyboard();
        products.forEach((product, index) => {
            const emoji = index % 3 === 0 ? '📦' : index % 3 === 1 ? '🎁' : '🛍';
            keyboard
                .text(`${emoji} ${(0, formatters_1.truncate)(product.name, 30)} - ${(0, formatters_1.formatPrice)(product.price)}`, `product:${product.id}`)
                .row();
        });
        // Pagination buttons
        const paginationRow = [];
        if (page > 1) {
            paginationRow.push(grammy_1.InlineKeyboard.text('⬅️ Назад', `catalog:page:${page - 1}`));
        }
        if (page < totalPages) {
            paginationRow.push(grammy_1.InlineKeyboard.text('➡️ Далее', `catalog:page:${page + 1}`));
        }
        if (paginationRow.length > 0) {
            keyboard.row(...paginationRow);
        }
        keyboard.row(grammy_1.InlineKeyboard.text('🏠 Главное меню', 'back:menu'));
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
    catch (error) {
        logger_1.logger.error('Error showing catalog:', error);
        await ctx.reply('❌ Ошибка при загрузке каталога. Попробуйте позже.');
    }
}
/**
 * Show product details
 */
async function showProductDetails(ctx, productId) {
    try {
        const product = await api_client_1.apiClient.getProduct(productId);
        ctx.session.currentProduct = product;
        const text = (0, formatters_1.formatProduct)(product);
        const keyboard = new grammy_1.InlineKeyboard();
        // Show variants if available
        if (product.variants && product.variants.length > 0) {
            keyboard.text('🎨 Выбрать вариант', `variants:${product.id}`).row();
        }
        else {
            // Direct order if no variants
            keyboard.text('🛍 Заказать', `order:product:${product.id}`).row();
        }
        keyboard.text('← К каталогу', 'back:catalog:1');
        // Send photo if available
        if (product.images && product.images.length > 0) {
            await ctx.replyWithPhoto(product.images[0], {
                caption: text,
                parse_mode: 'Markdown',
                reply_markup: keyboard,
            });
        }
        else {
            await ctx.editMessageText(text, {
                parse_mode: 'Markdown',
                reply_markup: keyboard,
            });
        }
    }
    catch (error) {
        logger_1.logger.error('Error showing product:', { productId, error });
        await ctx.reply('❌ Ошибка при загрузке товара.');
    }
}
/**
 * Show variants list
 */
async function showVariantsList(ctx, productId) {
    try {
        const product = await api_client_1.apiClient.getProduct(productId);
        let text = `🎨 **Выберите вариант**\n\n`;
        text += `Товар: ${product.name}\n\n`;
        const keyboard = new grammy_1.InlineKeyboard();
        product.variants?.forEach((variant) => {
            const finalPrice = product.price + variant.priceModifier;
            keyboard
                .text(`${variant.name} - ${(0, formatters_1.formatPrice)(finalPrice)} (В наличии: ${variant.stockQuantity})`, `variant:${product.id}:${variant.id}`)
                .row();
        });
        keyboard.text('← Назад', `product:${product.id}`);
        await ctx.editMessageText(text, {
            parse_mode: 'Markdown',
            reply_markup: keyboard,
        });
    }
    catch (error) {
        logger_1.logger.error('Error showing variants:', { productId, error });
        await ctx.reply('❌ Ошибка при загрузке вариантов.');
    }
}
/**
 * Show variant details and order button
 */
async function showVariantDetails(ctx, productId, variantId) {
    try {
        const product = await api_client_1.apiClient.getProduct(productId);
        const variant = product.variants?.find((v) => v.id === variantId);
        if (!variant) {
            await ctx.reply('❌ Вариант не найден.');
            return;
        }
        const text = (0, formatters_1.formatProduct)(product, variant);
        const keyboard = new grammy_1.InlineKeyboard()
            .text('🛍 Заказать', `order:variant:${product.id}:${variant.id}`)
            .row()
            .text('← К вариантам', `variants:${product.id}`);
        await ctx.editMessageText(text, {
            parse_mode: 'Markdown',
            reply_markup: keyboard,
        });
    }
    catch (error) {
        logger_1.logger.error('Error showing variant details:', { productId, variantId, error });
        await ctx.reply('❌ Ошибка при загрузке варианта.');
    }
}
//# sourceMappingURL=catalog.js.map