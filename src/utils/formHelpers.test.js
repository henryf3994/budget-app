import { describe, expect, it } from 'vitest';
import { PAYMENT_METHODS } from './constants.js';
import { buildSubmittedFormData, resolveCustomPaymentState } from './formHelpers.js';

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
