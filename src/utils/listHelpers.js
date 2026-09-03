import { FALLBACK_CATEGORY_COLOR } from './constants.js';

export const buildCategoryColorMap = (categories = []) =>
  new Map((Array.isArray(categories) ? categories : []).map(c => [c.name, c.color]));

export const getCategoryColor = (categoryName, categories = []) =>
  buildCategoryColorMap(categories).get(categoryName) || FALLBACK_CATEGORY_COLOR;

export const formatMoney = (amount, minimumFractionDigits = 1, maximumFractionDigits = 1) => {
  const value = Number(amount);
  const safe = Number.isFinite(value) ? value : 0;
  return safe.toLocaleString('en-US', {
    minimumFractionDigits,
    maximumFractionDigits
  });
};
