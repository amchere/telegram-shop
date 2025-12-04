import { Bot, InlineKeyboard } from 'grammy';
import type { BotContext } from '../types';
import { logger } from '../utils/logger';
import { apiClient } from '../services/api-client';
import { config } from '../config';
import { formatProduct, formatPrice, truncate } from '../utils/formatters';

/**
 * Register catalog handlers
 */
export function registerCatalogHandlers(bot: Bot<BotContext>) {
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
async function showCatalogPage(ctx: BotContext, page: number) {
  try {
    const { data: products, total } = await apiClient.getProducts(
      page,
      config.productsPerPage
    );

    if (products.length === 0) {
      await ctx.reply('❌ Каталог пуст.');
      return;
    }

    const totalPages = Math.ceil(total / config.productsPerPage);

    let text = `📚 **Каталог товаров**\n\n`;
    text += `Страница ${page} из ${totalPages}\n`;
    text += `Всего товаров: ${total}\n\n`;

    const keyboard = new InlineKeyboard();

    products.forEach((product, index) => {
      const emoji = index % 3 === 0 ? '📦' : index % 3 === 1 ? '🎁' : '🛍';
      keyboard
        .text(
          `${emoji} ${truncate(product.name, 30)} - ${formatPrice(product.price)}`,
          `product:${product.id}`
        )
        .row();
    });

    // Pagination buttons
    const paginationRow = [];
    if (page > 1) {
      paginationRow.push(InlineKeyboard.text('⬅️ Назад', `catalog:page:${page - 1}`));
    }
    if (page < totalPages) {
      paginationRow.push(InlineKeyboard.text('➡️ Далее', `catalog:page:${page + 1}`));
    }
    if (paginationRow.length > 0) {
      keyboard.row(...paginationRow);
    }

    keyboard.row(InlineKeyboard.text('🏠 Главное меню', 'back:menu'));

    if (ctx.callbackQuery) {
      await ctx.editMessageText(text, {
        parse_mode: 'Markdown',
        reply_markup: keyboard,
      });
    } else {
      await ctx.reply(text, {
        parse_mode: 'Markdown',
        reply_markup: keyboard,
      });
    }
  } catch (error) {
    logger.error('Error showing catalog:', error);
    await ctx.reply('❌ Ошибка при загрузке каталога. Попробуйте позже.');
  }
}

/**
 * Show product details
 */
async function showProductDetails(ctx: BotContext, productId: number) {
  try {
    const product = await apiClient.getProduct(productId);
    ctx.session.currentProduct = product;

    const text = formatProduct(product);

    const keyboard = new InlineKeyboard();

    // Show variants if available
    if (product.variants && product.variants.length > 0) {
      keyboard.text('🎨 Выбрать вариант', `variants:${product.id}`).row();
    } else {
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
    } else {
      await ctx.editMessageText(text, {
        parse_mode: 'Markdown',
        reply_markup: keyboard,
      });
    }
  } catch (error) {
    logger.error('Error showing product:', { productId, error });
    await ctx.reply('❌ Ошибка при загрузке товара.');
  }
}

/**
 * Show variants list
 */
async function showVariantsList(ctx: BotContext, productId: number) {
  try {
    const product = await apiClient.getProduct(productId);

    let text = `🎨 **Выберите вариант**\n\n`;
    text += `Товар: ${product.name}\n\n`;

    const keyboard = new InlineKeyboard();

    product.variants?.forEach((variant) => {
      const finalPrice = product.price + variant.priceModifier;
      keyboard
        .text(
          `${variant.name} - ${formatPrice(finalPrice)} (В наличии: ${variant.stockQuantity})`,
          `variant:${product.id}:${variant.id}`
        )
        .row();
    });

    keyboard.text('← Назад', `product:${product.id}`);

    await ctx.editMessageText(text, {
      parse_mode: 'Markdown',
      reply_markup: keyboard,
    });
  } catch (error) {
    logger.error('Error showing variants:', { productId, error });
    await ctx.reply('❌ Ошибка при загрузке вариантов.');
  }
}

/**
 * Show variant details and order button
 */
async function showVariantDetails(
  ctx: BotContext,
  productId: number,
  variantId: number
) {
  try {
    const product = await apiClient.getProduct(productId);
    const variant = product.variants?.find((v) => v.id === variantId);

    if (!variant) {
      await ctx.reply('❌ Вариант не найден.');
      return;
    }

    const text = formatProduct(product, variant);

    const keyboard = new InlineKeyboard()
      .text('🛍 Заказать', `order:variant:${product.id}:${variant.id}`)
      .row()
      .text('← К вариантам', `variants:${product.id}`);

    await ctx.editMessageText(text, {
      parse_mode: 'Markdown',
      reply_markup: keyboard,
    });
  } catch (error) {
    logger.error('Error showing variant details:', { productId, variantId, error });
    await ctx.reply('❌ Ошибка при загрузке варианта.');
  }
}
