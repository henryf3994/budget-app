import { describe, expect, it } from 'vitest';
import { CATEGORY_FILTER_ALL } from './constants.js';
import { matchesCategoryFilter, matchesSearchQuery } from './filters.js';

describe('matchesCategoryFilter', () => {
  it('選擇「全部」時一律通過（不需傳入 allValue）', () => {
    expect(matchesCategoryFilter(CATEGORY_FILTER_ALL, '工人')).toBe(true);
    expect(matchesCategoryFilter(CATEGORY_FILTER_ALL, undefined)).toBe(true);
  });

  it('比對類別名稱是否相同', () => {
    expect(matchesCategoryFilter('工人', '工人')).toBe(true);
    expect(matchesCategoryFilter('工人', 'Riley')).toBe(false);
    expect(matchesCategoryFilter('工人', undefined)).toBe(false);
  });

  it('可自訂 allValue 以支援不同語意的「全部」', () => {
    expect(matchesCategoryFilter('*', '工人', '*')).toBe(true);
  });
});

describe('matchesSearchQuery', () => {
  it('空白查詢一律通過', () => {
    expect(matchesSearchQuery('', ['超市買餸'])).toBe(true);
    expect(matchesSearchQuery('   ', ['超市買餸'])).toBe(true);
    expect(matchesSearchQuery(undefined, ['超市買餸'])).toBe(true);
  });

  it('不分大小寫並可命中任一欄位', () => {
    expect(matchesSearchQuery('netflix', ['人壽保險', 'Netflix'])).toBe(true);
    expect(matchesSearchQuery('NETFLIX', ['人壽保險', 'netflix'])).toBe(true);
    expect(matchesSearchQuery('買餸', ['超市買餸', 'FMH'])).toBe(true);
  });

  it('無命中或欄位為空值時回傳 false', () => {
    expect(matchesSearchQuery('旅行', ['超市買餸', 'FMH'])).toBe(false);
    expect(matchesSearchQuery('x', [null, undefined, ''])).toBe(false);
    expect(matchesSearchQuery('x')).toBe(false);
  });

  it('數字欄位會被轉成字串比對', () => {
    expect(matchesSearchQuery('12', [12])).toBe(true);
  });
});
