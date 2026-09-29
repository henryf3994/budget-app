import { describe, expect, it } from 'vitest';
import {
  ensureValidCategories,
  isValidAmount,
  isValidDate,
  isValidUrl,
  migrateLegacyCategories,
  normalizePaymentMethod,
  sanitizeRecurring,
  sanitizeText,
  sanitizeTransaction,
  validateRecurringFields,
  validateRecurringForm,
  validateTransactionFields,
  validateTransactionForm
} from './validation.js';
import { HOUSING_CATEGORY, TRANSPORT_CATEGORY } from './constants.js';

describe('isValidAmount', () => {
  it('接受大於 0 且最多 2 位小數的數字與字串', () => {
    expect(isValidAmount(1)).toBe(true);
    expect(isValidAmount('12.5')).toBe(true);
    expect(isValidAmount('12.34')).toBe(true);
    expect(isValidAmount(100000000)).toBe(true);
  });

  it('拒絕 0、負數、非數字與超過 2 位小數', () => {
    expect(isValidAmount(0)).toBe(false);
    expect(isValidAmount(-5)).toBe(false);
    expect(isValidAmount('abc')).toBe(false);
    expect(isValidAmount('')).toBe(false);
    expect(isValidAmount(null)).toBe(false);
    expect(isValidAmount('12.345')).toBe(false);
  });

  it('拒絕超過 1 億的金額', () => {
    expect(isValidAmount(100000001)).toBe(false);
  });
});

describe('isValidDate', () => {
  it('接受合法的 YYYY-MM-DD 與 ISO 字串', () => {
    expect(isValidDate('2026-02-28')).toBe(true);
    expect(isValidDate('2026-08-31')).toBe(true);
    expect(isValidDate('2026-08-31T10:00:00.000Z')).toBe(true);
  });

  it('拒絕不存在的日期與錯誤格式', () => {
    expect(isValidDate('2026-02-30')).toBe(false);
    expect(isValidDate('2026-13-01')).toBe(false);
    expect(isValidDate('2026/08/31')).toBe(false);
    expect(isValidDate('1999-12-31')).toBe(false);
    expect(isValidDate('')).toBe(false);
    expect(isValidDate(undefined)).toBe(false);
  });
});

describe('sanitizeText', () => {
  it('去除前後空白並將 null/undefined 轉為空字串', () => {
    expect(sanitizeText('  買餸  ')).toBe('買餸');
    expect(sanitizeText(null)).toBe('');
    expect(sanitizeText(undefined)).toBe('');
    expect(sanitizeText(42)).toBe('42');
  });
});

describe('ensureValidCategories', () => {
  it('保留具備 id 與 name 的項目', () => {
    const result = ensureValidCategories([
      { id: 'cat_1', name: '住屋交通' },
      { name: '沒有 id' },
      { id: 'cat_2' },
      null,
      '字串'
    ]);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('住屋交通');
  });

  it('非陣列輸入回傳空陣列', () => {
    expect(ensureValidCategories(null)).toEqual([]);
    expect(ensureValidCategories({ id: 'cat_1' })).toEqual([]);
  });
});

describe('migrateLegacyCategories', () => {
  const LEGACY_LIST = [
    { id: 'cat_1', name: '住屋交通', color: '#6366f1', defaultTitles: ['供樓'] },
    { id: 'cat_2', name: '保險訂閱', color: '#3b82f6', defaultTitles: ['Netflix'] }
  ];

  it('把「住屋交通」拆成相鄰的「住屋」與「交通」，其餘類別原樣保留', () => {
    const result = migrateLegacyCategories(LEGACY_LIST);
    expect(result.map(c => c.name)).toEqual(['住屋', '交通', '保險訂閱']);
    expect(result[2]).toEqual(LEGACY_LIST[1]);
  });

  it('「住屋」沿用舊項目的 id，並套用常數中的顏色與快速標題', () => {
    const result = migrateLegacyCategories([{ id: 'cat_custom', name: '住屋交通', color: '#000000' }]);
    expect(result[0].id).toBe('cat_custom');
    expect(result[0].name).toBe('住屋');
    expect(result[0].color).toBe(HOUSING_CATEGORY.color);
    expect(result[0].defaultTitles).toContain('供樓');
    expect(result[1].name).toBe('交通');
    expect(result[1].defaultTitles).toContain('油費');
  });

  it('已存在「交通」時不重複插入', () => {
    const result = migrateLegacyCategories([...LEGACY_LIST, { id: 'cat_8', name: '交通', color: '#0ea5e9' }]);
    expect(result.filter(c => c.name === '交通')).toHaveLength(1);
  });

  it('已遷移過或不含舊類別時原樣回傳（可重複執行）', () => {
    const alreadyMigrated = [HOUSING_CATEGORY, TRANSPORT_CATEGORY];
    expect(migrateLegacyCategories(alreadyMigrated)).toEqual(alreadyMigrated);
  });

  it('非陣列輸入回傳空陣列', () => {
    expect(migrateLegacyCategories(null)).toEqual([]);
    expect(migrateLegacyCategories('住屋交通')).toEqual([]);
  });
});

describe('sanitizeTransaction', () => {
  it('清洗欄位並保留合法資料', () => {
    const result = sanitizeTransaction({
      id: 'tx_1',
      date: '2026-08-31T00:00:00.000Z',
      amount: '120.5',
      category: '  購物娛樂 ',
      title: '  超市買餸 ',
      payer: 'FMH',
      paymentMethod: '信用卡',
      note: null
    });

    expect(result).toEqual({
      id: 'tx_1',
      date: '2026-08-31',
      amount: 120.5,
      category: '購物娛樂',
      title: '超市買餸',
      payer: 'FMH',
      paymentMethod: '信用卡',
      note: ''
    });
  });

  it('日期或金額無效時回傳 null（不再產生幽靈列）', () => {
    expect(sanitizeTransaction({ date: '2026-02-30', amount: 10 })).toBeNull();
    expect(sanitizeTransaction({ date: '2026-02-28', amount: 0 })).toBeNull();
    expect(sanitizeTransaction(null)).toBeNull();
  });

  it('缺少 id 時自動補上，類別／標題缺少時帶入預設值', () => {
    const result = sanitizeTransaction({ date: '2026-08-01', amount: 1 });
    expect(result.id).toMatch(/^tx_/);
    expect(result.category).toBe('其他');
    expect(result.title).toBe('未命名支出');
  });
});

describe('sanitizeRecurring', () => {
  it('修正無效的 amount 與 dayOfMonth', () => {
    const result = sanitizeRecurring({ amount: '-3', dayOfMonth: '99' });
    expect(result.amount).toBe(0);
    expect(result.dayOfMonth).toBe(1);
    expect(result.frequency).toBe('Monthly');
    expect(result.id).toMatch(/^rec_/);
  });

  it('保留合法資料', () => {
    const result = sanitizeRecurring({
      id: 'rec_1',
      amount: '2000',
      category: '工人',
      title: '月薪',
      payer: 'YSK',
      paymentMethod: '轉賬',
      dayOfMonth: '15'
    });
    expect(result).toEqual({
      id: 'rec_1',
      amount: 2000,
      category: '工人',
      title: '月薪',
      payer: 'YSK',
      paymentMethod: '轉賬',
      note: '',
      frequency: 'Monthly',
      dayOfMonth: 15
    });
  });
});

describe('欄位驗證', () => {
  it('validateTransactionFields 回報所有缺少的欄位', () => {
    const errors = validateTransactionFields({ amount: '0', title: '  ', date: 'bad' });
    expect(Object.keys(errors).sort()).toEqual(['amount', 'date', 'title']);
  });

  it('validateTransactionFields 在使用自訂付款方式時要求填寫內容', () => {
    const errors = validateTransactionFields({
      amount: 10,
      title: '午餐',
      date: '2026-08-31',
      isCustomPayment: true,
      customPaymentMethod: '  '
    });
    expect(errors.customPaymentMethod).toBe('請填寫自訂付款方式！');
  });

  it('validateTransactionFields 於資料完整時回傳空物件', () => {
    expect(validateTransactionFields({ amount: '9.9', title: '午餐', date: '2026-08-31' })).toEqual({});
  });

  it('validateRecurringFields 檢查扣款日期需介於 1 至 31', () => {
    const invalid = validateRecurringFields({ amount: 100, title: '月薪', dayOfMonth: 0 });
    expect(invalid.dayOfMonth).toBe('請輸入 1 至 31 之間的扣款日期！');
    expect(validateRecurringFields({ amount: 100, title: '月薪', dayOfMonth: 31 })).toEqual({});
  });

  it('validateTransactionForm / validateRecurringForm 回傳第一筆錯誤訊息或 null', () => {
    expect(validateTransactionForm({})).toBe('請輸入大於 0 且最多 2 位小數的金額！');
    expect(validateTransactionForm({ amount: 1, title: '午餐', date: '2026-08-31' })).toBeNull();
    expect(validateRecurringForm({ amount: 1, title: '月薪', dayOfMonth: 5 })).toBeNull();
  });
});

describe('normalizePaymentMethod', () => {
  it('使用自訂付款方式時回傳自訂值', () => {
    expect(normalizePaymentMethod({ isCustomPayment: true, customPaymentMethod: ' PayMe ' })).toBe('PayMe');
  });

  it('否則回傳一般付款方式，缺少資料時回傳空字串', () => {
    expect(normalizePaymentMethod({ paymentMethod: '現金' })).toBe('現金');
    expect(normalizePaymentMethod(null)).toBe('');
  });
});

describe('isValidUrl', () => {
  it('僅接受 https 網址', () => {
    expect(isValidUrl('https://script.google.com/macros/s/abc/exec')).toBe(true);
    expect(isValidUrl('http://script.google.com/macros/s/abc/exec')).toBe(false);
    expect(isValidUrl('not-a-url')).toBe(false);
    expect(isValidUrl('   ')).toBe(false);
  });
});
