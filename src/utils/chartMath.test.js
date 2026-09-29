import { describe, expect, it } from 'vitest';
import { addMonths, formatCompact, formatTooltip, monthKey, niceCeil } from './chartMath.js';

describe('addMonths', () => {
  it('在同一年內前後增減月份', () => {
    expect(addMonths(2026, 5, 1)).toEqual({ year: 2026, month: 6 });
    expect(addMonths(2026, 5, -3)).toEqual({ year: 2026, month: 2 });
  });

  it('正確跨年（往前與往後）', () => {
    expect(addMonths(2026, 1, -1)).toEqual({ year: 2025, month: 12 });
    expect(addMonths(2026, 12, 1)).toEqual({ year: 2027, month: 1 });
    expect(addMonths(2026, 3, -6)).toEqual({ year: 2025, month: 9 });
  });

  it('delta 為 0 時回傳原本的年月', () => {
    expect(addMonths(2026, 8, 0)).toEqual({ year: 2026, month: 8 });
  });
});

describe('monthKey', () => {
  it('補零成 YYYY-MM 格式', () => {
    expect(monthKey(2026, 8)).toBe('2026-08');
    expect(monthKey(2026, 12)).toBe('2026-12');
  });
});

describe('niceCeil', () => {
  it('進位到 1 / 2 / 5 / 10 的倍數', () => {
    expect(niceCeil(1)).toBe(1);
    expect(niceCeil(1.5)).toBe(2);
    expect(niceCeil(3)).toBe(5);
    expect(niceCeil(8)).toBe(10);
    expect(niceCeil(12)).toBe(20);
    expect(niceCeil(450)).toBe(500);
    expect(niceCeil(12500)).toBe(20000);
  });

  it('0 或負數回傳 1，避免除以 0', () => {
    expect(niceCeil(0)).toBe(1);
    expect(niceCeil(-100)).toBe(1);
  });
});

describe('formatCompact', () => {
  it('依金額大小選擇顯示格式', () => {
    expect(formatCompact(0)).toBe('0');
    expect(formatCompact(999)).toBe('999');
    expect(formatCompact(1500)).toBe('1.5k');
    expect(formatCompact(12500)).toBe('13k');
  });
});

describe('formatTooltip', () => {
  it('產生年月與千分位金額標籤', () => {
    expect(formatTooltip(2026, 8, 12500)).toBe('2026年8月: HK$ 12,500');
    expect(formatTooltip(2026, 1, 0)).toBe('2026年1月: HK$ 0');
  });
});
