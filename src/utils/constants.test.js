import { describe, expect, it } from 'vitest';
import {
  CATEGORY_FILTER_ALL,
  DEFAULT_CATEGORY_NAME,
  FALLBACK_CATEGORY_COLOR,
  INITIAL_CATEGORIES,
  LEGACY_HOUSING_TRANSPORT_NAME,
  PAYERS,
  PAYMENT_METHODS,
  STORAGE_KEYS,
  getLocalDateString,
  getPaymentMethodStyle,
  getPayerStyle
} from './constants.js';

describe('getPayerStyle', () => {
  it('回傳付款人對應的按鈕／徽章樣式', () => {
    expect(getPayerStyle('YSK')).toContain('emerald');
    expect(getPayerStyle('FMH')).toContain('violet');
    expect(getPayerStyle('FMH', 'badge')).toContain('violet');
  });

  it('未知付款人退回預設樣式；未知 variant 退回 button', () => {
    expect(getPayerStyle('UNKNOWN')).toBe(getPayerStyle('UNKNOWN', 'button'));
    expect(getPayerStyle('YSK')).toBe(getPayerStyle('YSK', 'button'));
    expect(getPayerStyle('YSK', 'not-a-variant')).toBe(getPayerStyle('YSK'));
  });
});

describe('getPaymentMethodStyle', () => {
  it('回傳付款方式對應的樣式並去除前後空白', () => {
    expect(getPaymentMethodStyle('信用卡')).toBe(getPaymentMethodStyle('  信用卡  '));
    expect(getPaymentMethodStyle('Alipay')).toContain('emerald');
  });

  it('自訂付款方式退回 OTHER 樣式（與原本的 DEFAULT 相同）', () => {
    const other = getPaymentMethodStyle('');
    expect(getPaymentMethodStyle('自訂方式')).toBe(other);
    expect(other).toContain('rose');
  });

  it('badge variant 與 button variant 不同', () => {
    expect(getPaymentMethodStyle('現金', 'badge')).not.toBe(getPaymentMethodStyle('現金'));
  });
});

describe('getLocalDateString', () => {
  it('回傳 YYYY-MM-DD 格式的今天日期', () => {
    expect(getLocalDateString()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    const now = new Date();
    const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    expect(getLocalDateString()).toBe(expected);
  });
});

describe('共用常數', () => {
  it('預設類別名稱與「其他」的顏色保持關聯', () => {
    expect(DEFAULT_CATEGORY_NAME).toBe('其他');
    expect(FALLBACK_CATEGORY_COLOR).toBe(INITIAL_CATEGORIES.find(c => c.name === DEFAULT_CATEGORY_NAME).color);
  });

  it('付款人與付款方式清單符合前端假設', () => {
    expect(PAYERS).toEqual(['YSK', 'FMH']);
    expect(PAYMENT_METHODS).toContain('信用卡');
    expect(CATEGORY_FILTER_ALL).toBe('ALL');
  });

  it('「住屋」與「交通」已拆分為兩個獨立類別', () => {
    const names = INITIAL_CATEGORIES.map(c => c.name);
    expect(names).toContain('住屋');
    expect(names).toContain('交通');
    expect(names).not.toContain(LEGACY_HOUSING_TRANSPORT_NAME);
  });

  it('localStorage 鍵值集中定義且不重複', () => {
    const keys = Object.values(STORAGE_KEYS);
    expect(new Set(keys).size).toBe(keys.length);
    expect(STORAGE_KEYS.categories).toBe('app_categories');
    expect(STORAGE_KEYS.transactionsCache).toBe('app_transactions_cache');
    expect(STORAGE_KEYS.recurringCache).toBe('app_recurring_cache');
    expect(STORAGE_KEYS.gasUrl).toBe('gas_app_url');
    expect(STORAGE_KEYS.gasApiToken).toBe('gas_api_token');
  });
});
