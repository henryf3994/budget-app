// =========================================================================
// 📁 src/utils/helpers.test.js (小型純函數模組的測試)
// =========================================================================
// 原本分散為 id / filters / formHelpers / chartMath 四個測試檔，每個都不足 60 行；
// 合併為單檔以減少檔案數，但每個模組仍各自一個 describe，失敗時可依名稱定位。
import { describe, expect, it } from 'vitest';
import { CATEGORY_FILTER_ALL, PAYMENT_METHODS } from './constants.js';
import { addMonths, formatCompact, formatTooltip, monthKey, niceCeil } from './chartMath.js';
import { matchesCategoryFilter, matchesSearchQuery } from './filters.js';
import { buildSubmittedFormData, resolveCustomPaymentState } from './formHelpers.js';
import { createId } from './id.js';

describe('createId', () => {
  it('帶上呼叫端指定的前綴', () => {
    expect(createId('tx_')).toMatch(/^tx_/);
    expect(createId('temp_rec_')).toMatch(/^temp_rec_/);
    expect(createId()).toMatch(/^id_/);
  });

  it('同一毫秒內連續呼叫也不會重複', () => {
    const ids = new Set(Array.from({ length: 500 }, () => createId('tx_')));
    expect(ids.size).toBe(500);
  });

  it('不同前綴產生不同的 id', () => {
    const a = createId('tx_');
    const b = createId('rec_');
    expect(a).not.toBe(b);
    expect(a.replace(/^tx_/, '')).not.toBe(b.replace(/^rec_/, ''));
  });
});

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

describe('resolveCustomPaymentState', () => {
  it('一般付款方式維持原值並清空自訂欄位', () => {
    expect(resolveCustomPaymentState({ paymentMethod: '現金' })).toEqual({
      paymentMethod: '現金',
      customPaymentMethod: '',
      isCustomPayment: false
    });
  });

  it('非清單中的付款方式視為自訂並移到 customPaymentMethod', () => {
    expect(resolveCustomPaymentState({ paymentMethod: 'PayMe' })).toEqual({
      paymentMethod: PAYMENT_METHODS[0],
      customPaymentMethod: 'PayMe',
      isCustomPayment: true
    });
  });

  it('缺少付款方式時退回第一個選項', () => {
    expect(resolveCustomPaymentState({})).toEqual({
      paymentMethod: PAYMENT_METHODS[0],
      customPaymentMethod: '',
      isCustomPayment: false
    });
    expect(resolveCustomPaymentState().isCustomPayment).toBe(false);
  });
});

describe('buildSubmittedFormData', () => {
  it('清洗標題並以付款方式欄位覆蓋 paymentMethod', () => {
    const result = buildSubmittedFormData({
      title: '  午餐  ',
      paymentMethod: '現金',
      isCustomPayment: true,
      customPaymentMethod: 'PayMe',
      amount: '58'
    });

    expect(result.title).toBe('午餐');
    expect(result.paymentMethod).toBe('PayMe');
    expect(result.amount).toBe('58');
  });

  it('保留其他欄位不變', () => {
    const result = buildSubmittedFormData({ title: '午餐', date: '2026-08-31', category: '工人' });
    expect(result.date).toBe('2026-08-31');
    expect(result.category).toBe('工人');
    // 沒有提供付款方式時會被清洗成空字串，由呼叫端決定是否補預設值
    expect(result.paymentMethod).toBe('');
  });
});

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
