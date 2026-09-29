import { describe, expect, it } from 'vitest';
import { DEFAULT_CATEGORY_NAME, FALLBACK_CATEGORY_COLOR, INITIAL_CATEGORIES } from './constants.js';
import { buildCategoryColorMap, formatMoney, getCategoryColorFromMap } from './listHelpers.js';

const CATEGORIES = [
  { id: 'cat_1', name: '住屋交通', color: '#6366f1' },
  { id: 'cat_7', name: DEFAULT_CATEGORY_NAME, color: '#8b5cf6' }
];

describe('buildCategoryColorMap', () => {
  it('建立「類別名稱 → 顏色」的 Map', () => {
    const map = buildCategoryColorMap(CATEGORIES);
    expect(map.get('住屋交通')).toBe('#6366f1');
    expect(map.get(DEFAULT_CATEGORY_NAME)).toBe('#8b5cf6');
    expect(map.size).toBe(2);
  });

  it('忽略沒有名稱的項目，非陣列輸入回傳空 Map', () => {
    expect(buildCategoryColorMap([{ color: '#fff' }, null]).size).toBe(0);
    expect(buildCategoryColorMap(undefined).size).toBe(0);
  });
});

describe('getCategoryColorFromMap', () => {
  const map = buildCategoryColorMap(CATEGORIES);

  it('優先回傳該類別的顏色', () => {
    expect(getCategoryColorFromMap(map, '住屋交通')).toBe('#6366f1');
  });

  it('未知類別退回「其他」的顏色', () => {
    expect(getCategoryColorFromMap(map, '已刪除的類別')).toBe('#8b5cf6');
  });

  it('連「其他」都不存在時退回主題 fallback（不再回傳 undefined）', () => {
    const empty = buildCategoryColorMap([]);
    expect(getCategoryColorFromMap(empty, '已刪除的類別')).toBe(FALLBACK_CATEGORY_COLOR);
  });
});

describe('formatMoney', () => {
  it('預設保留 1 位小數並加上千分位', () => {
    expect(formatMoney(1234.56)).toBe('1,234.6');
    expect(formatMoney('2500')).toBe('2,500.0');
  });

  it('可指定小數位數', () => {
    expect(formatMoney(1234.56, 0, 0)).toBe('1,235');
    expect(formatMoney(1234.567, 2, 2)).toBe('1,234.57');
  });

  it('無法解析的數值以 0 處理', () => {
    expect(formatMoney('abc')).toBe('0.0');
    expect(formatMoney(null)).toBe('0.0');
  });
});

describe('INITIAL_CATEGORIES', () => {
  it('每筆類別都有 id／name／color 與快速標題', () => {
    INITIAL_CATEGORIES.forEach(category => {
      expect(typeof category.id).toBe('string');
      expect(category.name).toBeTruthy();
      expect(category.color).toMatch(/^#[0-9a-f]{6}$/i);
      expect(Array.isArray(category.defaultTitles)).toBe(true);
    });
  });

  it('包含預設類別「其他」', () => {
    expect(INITIAL_CATEGORIES.some(c => c.name === DEFAULT_CATEGORY_NAME)).toBe(true);
  });
});
