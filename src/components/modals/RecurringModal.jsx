import React, { useState, useRef } from 'react';
import { X, RefreshCw, Trash2 } from 'lucide-react';
import { PAYERS, PAYMENT_METHODS, getPayerStyle, getPaymentMethodStyle } from '../../utils/constants.js';
import { useOnClickOutside } from '../../hooks/useOnClickOutside.js';
import { normalizePaymentMethod, sanitizeText, validateRecurringFields } from '../../utils/validation.js';

// =========================================================================
// 📁 src/components/modals/RecurringModal.jsx
// =========================================================================
function RecurringModal({ 
  recurringExpenses = [], 
  categories = [], 
  onClose, 
  onAdd, 
  onDelete, 
  loading 
}) {
  // 安全取得第一個分類名稱
  const modalRef = useRef(null);
  useOnClickOutside(modalRef, onClose);
  
  const defaultCategory = Array.isArray(categories) && categories.length > 0 
    ? (categories[0]?.name || '其他') 
    : '其他';

  const defaultPayer = Array.isArray(PAYERS) && PAYERS.length > 0 ? PAYERS[0] : '';
  const defaultPaymentMethod = Array.isArray(PAYMENT_METHODS) && PAYMENT_METHODS.length > 0 ? PAYMENT_METHODS[0] : '';

  const [newRec, setNewRec] = useState({
    amount: '',
    category: defaultCategory,
    title: '',
    payer: defaultPayer,
    paymentMethod: defaultPaymentMethod,
    customPaymentMethod: '',
    isCustomPayment: false,
    note: '',
    frequency: 'Monthly',
    dayOfMonth: 1
  });
  const [fieldErrors, setFieldErrors] = useState({});

  const handleAddSubmit = (e) => {
    e.preventDefault();

    const errors = validateRecurringFields(newRec);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    const finalData = {
      ...newRec,
      title: sanitizeText(newRec.title),
      paymentMethod: normalizePaymentMethod(newRec)
    };

    onAdd(finalData);
    setNewRec({
      amount: '',
      category: defaultCategory,
      title: '',
      payer: defaultPayer,
      paymentMethod: defaultPaymentMethod,
      customPaymentMethod: '',
      isCustomPayment: false,
      note: '',
      frequency: 'Monthly',
      dayOfMonth: 1
    });
    setFieldErrors({});
  };

  const safeCategories = Array.isArray(categories) ? categories : [];
  const safeRecurring = Array.isArray(recurringExpenses) ? recurringExpenses : [];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        ref={modalRef}
        className="recurring-modal pixel-card bg-surface max-w-xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted hover:text-ink">
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-ink mb-2 flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-primary-dark" />
          恆常固定支出
        </h3>
        <p className="text-xs text-muted mb-4">
          設定每月扣款日，每日排程自動產生交易至記帳本。
        </p>

        <form onSubmit={handleAddSubmit} className="bg-surface-warm border-2 border-ink p-4 rounded-pixel-sm space-y-4 mb-6">
          <div className="text-xs font-semibold text-primary-dark">新增恆常開支設定：</div>

          <div>
            <label className="block text-lg font-medium text-muted mb-1">項目標題</label>
            <div className="pixel-border-sm p-0.5">
              <input 
                type="text"
                required
                maxLength={50}
                placeholder="請輸入固定支出名稱"
                value={newRec.title}
                onChange={(e) => {
                  setNewRec({ ...newRec, title: e.target.value });
                  setFieldErrors(prev => ({ ...prev, title: '' }));
                }}
                className="relative z-0 w-full bg-surface-soft border-0 rounded-none px-3 py-2 text-sm text-ink focus:outline-none"
              />
            </div>
            {fieldErrors.title && <p className="text-[11px] text-danger mt-1">{fieldErrors.title}</p>}
          </div>

          <div>
            <label className="block text-lg font-medium text-muted mb-1">金額</label>
            <div className="pixel-border-sm relative p-0.5">
              <span className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-muted text-sm font-semibold">HK$</span>
              <input 
                type="number"
                step="1"
                required
                placeholder="0"
                value={newRec.amount}
                onChange={(e) => {
                  setNewRec({ ...newRec, amount: e.target.value });
                  setFieldErrors(prev => ({ ...prev, amount: '' }));
                }}
                className={`relative z-0 w-full bg-surface-soft border-0 rounded-none pl-12 pr-3 py-2 text-ink text-base font-bold focus:outline-none ${
                  fieldErrors.amount ? 'border-danger' : 'border-ink focus:border-primary'
                }`}
              />
            </div>
            {fieldErrors.amount && <p className="text-[11px] text-danger mt-1">{fieldErrors.amount}</p>}
          </div>

          <div>
            <label className="block text-lg font-medium text-muted mb-1">類別</label>
            <div className="pixel-border-sm p-0.5">
              <select 
                value={newRec.category}
                onChange={(e) => setNewRec({ ...newRec, category: e.target.value })}
                className="relative z-0 w-full bg-surface-soft border-0 rounded-none px-3 py-2 text-sm text-ink focus:outline-none focus:border-primary"
              >
                {safeCategories.length > 0 ? safeCategories.map(c => (
                  <option key={c.id || c.name} value={c.name}>{c.name}</option>
                )) : (
                  <option value="其他">其他</option>
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-lg font-medium text-muted mb-1">付款人</label>
            <div className="grid grid-cols-2 gap-2">
              {(PAYERS || []).map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setNewRec({ ...newRec, payer: p })}
                  className={`pixel-border-sm py-2 px-3 rounded-xl border text-sm font-semibold transition ${
                    newRec.payer === p
                      ? getPayerStyle(p, 'button')
                      : 'bg-surface-soft border-2 border-ink text-muted hover:bg-surface-warm'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-lg font-medium text-muted mb-1">付款方式</label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              {(PAYMENT_METHODS || []).map(pm => (
                <button
                  key={pm}
                  type="button"
                  onClick={() => setNewRec({ ...newRec, paymentMethod: pm, isCustomPayment: false })}
                  className={`pixel-border-sm py-1.5 px-3 rounded-xl border text-[15.6px] font-medium transition ${
                    !newRec.isCustomPayment && newRec.paymentMethod === pm
                      ? getPaymentMethodStyle(pm, 'button')
                      : 'bg-surface-soft border-2 border-ink text-muted hover:bg-surface-warm'
                  }`}
                >
                  {pm}
                </button>
              ))}
            </div>
            <input 
              type="text"
              maxLength={30}
              placeholder="自訂其他付款方式..."
              value={newRec.customPaymentMethod}
              onChange={(e) => {
                setNewRec({
                  ...newRec,
                  customPaymentMethod: e.target.value,
                  isCustomPayment: true
                });
                setFieldErrors(prev => ({ ...prev, customPaymentMethod: '' }));
              }}
              className={`pixel-border-sm w-full bg-surface-soft border-2 rounded-pixel-sm px-3 py-1.5 text-xs text-ink focus:outline-none ${
                newRec.isCustomPayment ? 'border-danger bg-surface-warm' : 'border-ink'
              } ${fieldErrors.customPaymentMethod ? 'border-danger' : ''}`}
            />
            {fieldErrors.customPaymentMethod && <p className="text-[11px] text-danger mt-1">{fieldErrors.customPaymentMethod}</p>}
          </div>

          <div>
            <label className="block text-lg font-medium text-muted mb-1">每月扣款日</label>
            <div className="flex items-center gap-2">
              <div className="pixel-border-sm flex-1 p-0.5">
                <input 
                  type="number"
                  min="1"
                  max="31"
                  value={newRec.dayOfMonth}
                  onChange={(e) => {
                    setNewRec({ ...newRec, dayOfMonth: e.target.value });
                    setFieldErrors(prev => ({ ...prev, dayOfMonth: '' }));
                  }}
                  className="relative z-0 w-full bg-surface-soft border-0 rounded-none px-3 py-2 text-[21px] text-ink text-center focus:outline-none"
                />
              </div>
              <span className="text-[21px] text-muted shrink-0">號</span>
            </div>
            {fieldErrors.dayOfMonth && <p className="text-[11px] text-danger mt-1">{fieldErrors.dayOfMonth}</p>}
          </div>

          <div>
            <label className="block text-lg font-medium text-muted mb-1">備註</label>
            <div className="pixel-border-sm p-0.5">
              <input 
                type="text"
                maxLength={200}
                placeholder="可留空"
                value={newRec.note}
                onChange={(e) => setNewRec({ ...newRec, note: e.target.value })}
                className="relative z-0 w-full bg-surface-soft border-0 rounded-none px-3 py-2 text-sm text-ink focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2">
            <button 
              type="submit"
              disabled={loading}
              className="pixel-button-accent w-full py-2.5"
            >
              {loading ? '正在提交中...' : '+ 新增恆常項目'}
            </button>
          </div>
        </form>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {safeRecurring.length === 0 ? (
            <div className="text-center py-6 text-muted text-xs">目前沒有恆常固定支出</div>
          ) : (
            safeRecurring.map((item, index) => (
              <div key={item.id || `rec-${index}`} className="recurring-item pixel-border-sm p-3 bg-surface-soft flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-ink flex items-center gap-2">
                    {item.title}
                    <span className="text-[10px] px-1.5 py-0.2 rounded-pixel-sm bg-accent text-ink border border-ink">
                      每月 {item.dayOfMonth} 號扣款
                    </span>
                  </div>
                  <div className="text-muted mt-0.5">
                    {item.category} • {item.payer} • {item.paymentMethod}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-ink">HK$ {(Number.isFinite(Number(item.amount)) ? Number(item.amount) : 0).toFixed(2)}</span>
                  <button 
                    onClick={() => onDelete(item.id)}
                    className="text-danger hover:text-primary-dark"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default RecurringModal;
