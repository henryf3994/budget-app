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
        className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-indigo-400" />
          恆常固定支出 (Recurring Expenses)
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          設定每月扣款日 (`dayOfMonth`)，GAS 每日排程自動產生交易至記帳本。
        </p>

        <form onSubmit={handleAddSubmit} className="bg-slate-950 border border-slate-800/80 p-4 rounded-xl space-y-4 mb-6">
          <div className="text-xs font-semibold text-indigo-300">新增恆常開支設定：</div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">項目標題 (title)</label>
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
              className={`w-full bg-slate-900 border rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none ${
                fieldErrors.title ? 'border-rose-500' : 'border-slate-800 focus:border-indigo-500'
              }`}
            />
            {fieldErrors.title && <p className="text-[11px] text-rose-400 mt-1">{fieldErrors.title}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">金額 (amount)</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-500 text-sm font-semibold">HK$</span>
              <input 
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={newRec.amount}
                onChange={(e) => {
                  setNewRec({ ...newRec, amount: e.target.value });
                  setFieldErrors(prev => ({ ...prev, amount: '' }));
                }}
                className={`w-full bg-slate-900 border rounded-xl pl-12 pr-3 py-2 text-slate-100 text-base font-bold focus:outline-none ${
                  fieldErrors.amount ? 'border-rose-500' : 'border-slate-800 focus:border-indigo-500'
                }`}
              />
            </div>
            {fieldErrors.amount && <p className="text-[11px] text-rose-400 mt-1">{fieldErrors.amount}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">類別 (category)</label>
            <select 
              value={newRec.category}
              onChange={(e) => setNewRec({ ...newRec, category: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              {safeCategories.length > 0 ? safeCategories.map(c => (
                <option key={c.id || c.name} value={c.name}>{c.name}</option>
              )) : (
                <option value="其他">其他</option>
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">付款人 (payer)</label>
            <div className="grid grid-cols-2 gap-2">
              {(PAYERS || []).map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setNewRec({ ...newRec, payer: p })}
                  className={`py-2 px-3 rounded-xl border text-sm font-semibold transition ${
                    newRec.payer === p
                      ? getPayerStyle(p, 'button')
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">付款方式 (paymentMethod)</label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              {(PAYMENT_METHODS || []).map(pm => (
                <button
                  key={pm}
                  type="button"
                  onClick={() => setNewRec({ ...newRec, paymentMethod: pm, isCustomPayment: false })}
                  className={`py-1.5 px-3 rounded-xl border text-xs font-medium transition ${
                    !newRec.isCustomPayment && newRec.paymentMethod === pm
                      ? getPaymentMethodStyle(pm, 'button')
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
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
              className={`w-full bg-slate-900 border rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none ${
                newRec.isCustomPayment ? 'border-rose-500 bg-rose-500/10' : 'border-slate-800'
              } ${fieldErrors.customPaymentMethod ? 'border-rose-500' : ''}`}
            />
            {fieldErrors.customPaymentMethod && <p className="text-[11px] text-rose-400 mt-1">{fieldErrors.customPaymentMethod}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">每月扣款日 (dayOfMonth)</label>
            <div className="flex items-center gap-2">
              <input 
                type="number"
                min="1"
                max="31"
                value={newRec.dayOfMonth}
                onChange={(e) => {
                  setNewRec({ ...newRec, dayOfMonth: e.target.value });
                  setFieldErrors(prev => ({ ...prev, dayOfMonth: '' }));
                }}
                className={`w-full bg-slate-900 border rounded-xl px-3 py-2 text-sm text-slate-100 text-center focus:outline-none ${
                  fieldErrors.dayOfMonth ? 'border-rose-500' : 'border-slate-800 focus:border-indigo-500'
                }`}
              />
              <span className="text-xs text-slate-400 shrink-0">號</span>
            </div>
            {fieldErrors.dayOfMonth && <p className="text-[11px] text-rose-400 mt-1">{fieldErrors.dayOfMonth}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">備註 (note)</label>
            <input 
              type="text"
              maxLength={200}
              placeholder="可留空"
              value={newRec.note}
              onChange={(e) => setNewRec({ ...newRec, note: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-2">
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-indigo-900/30 transition"
            >
              {loading ? '正在提交中...' : '+ 新增恆常項目'}
            </button>
          </div>
        </form>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {safeRecurring.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-xs">目前沒有恆常固定支出</div>
          ) : (
            safeRecurring.map((item, index) => (
              <div key={item.id || `rec-${index}`} className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-white flex items-center gap-2">
                    {item.title}
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300">
                      每月 {item.dayOfMonth} 號扣款
                    </span>
                  </div>
                  <div className="text-slate-400 mt-0.5">
                    {item.category} • {item.payer} • {item.paymentMethod}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-indigo-300">HK$ {(Number.isFinite(Number(item.amount)) ? Number(item.amount) : 0).toFixed(2)}</span>
                  <button 
                    onClick={() => onDelete(item.id)}
                    className="text-slate-500 hover:text-rose-400"
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
