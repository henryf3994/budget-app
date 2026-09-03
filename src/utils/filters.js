import { sanitizeText } from './validation.js';

export const matchesCategoryFilter = (selectedCategory, itemCategory, allValue) =>
  selectedCategory === allValue || itemCategory === selectedCategory;

export const matchesSearchQuery = (query, values = []) => {
  const normalized = sanitizeText(query).toLowerCase();
  if (!normalized) return true;

  return values.some(value => {
    if (value === null || value === undefined) return false;
    return String(value).toLowerCase().includes(normalized);
  });
};
