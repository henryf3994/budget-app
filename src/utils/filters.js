import { CATEGORY_FILTER_ALL } from './constants.js';
import { sanitizeText } from './validation.js';

// allValue 預設即為「全部」篩選值，呼叫端不需要再傳入同一個常數
export const matchesCategoryFilter = (selectedCategory, itemCategory, allValue = CATEGORY_FILTER_ALL) =>
  selectedCategory === allValue || itemCategory === selectedCategory;

export const matchesSearchQuery = (query, values = []) => {
  const normalized = sanitizeText(query).toLowerCase();
  if (!normalized) return true;

  return values.some(value => {
    if (value === null || value === undefined) return false;
    return String(value).toLowerCase().includes(normalized);
  });
};
