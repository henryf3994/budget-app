import { DEFAULT_CATEGORY_NAME, FALLBACK_CATEGORY_COLOR } from './constants.js';

export const buildCategoryColorMap = (categories = []) =>
  new Map((Array.isArray(categories) ? categories : []).filter(c => c?.name).map(c => [c.name, c.color]));

// 依類別名稱取色：找不到時退回「其他」的顏色，最後退回主題 fallback。
// （避免回傳 undefined 讓色條／文字顏色整條消失）
export const getCategoryColorFromMap = (colorMap, categoryName) =>
  colorMap.get(categoryName) || colorMap.get(DEFAULT_CATEGORY_NAME) || FALLBACK_CATEGORY_COLOR;

export const formatMoney = (amount, minimumFractionDigits = 1, maximumFractionDigits = 1) => {
  const value = Number(amount);
  const safe = Number.isFinite(value) ? value : 0;
  return safe.toLocaleString('en-US', {
    minimumFractionDigits,
    maximumFractionDigits
  });
};
