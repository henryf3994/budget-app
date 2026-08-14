
import React, { useState, useMemo, useRef } from 'react';
import { X, Plus, Calendar } from 'lucide-react';
import { INITIAL_CATEGORIES, PAYERS, PAYMENT_METHODS, getLocalDateString, getPayerStyle, getPaymentMethodStyle } from '../../utils/constants.js';
import { useOnClickOutside } from '../../hooks/useOnClickOutside.js';
import { normalizePaymentMethod, sanitizeText, validateTransactionFields } from '../../utils/validation.js';
import MiniCalendar from '../MiniCalendar.jsx';

// =========================================================================
// 📁 src/components/modals/AddTransactionModal.jsx
// =========================================================================
function AddTransactionModal({ categories, onClose, onSubmit, loading }) {
  const safeCategories = Array.isArray(categories) ? categories : [];
  const [formData, setFormData] = useState({
    date: getLocalDateString(),
    amount: '',
    category: safeCategories[0]?.name || INITIAL_CATEGORIES[0].name,
    title: '',
    payer: PAYERS[0],
    paymentMethod: PAYMENT_METHODS[0],
    customPaymentMethod: '',
    isCustomPayment: false,
    note: ''
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [showCalendar, setShowCalendar] = useState(false);

  const modalRef = useRef(null);
  useOnClickOutside(modalRef, onClose);
  
  const currentCategoryTitles = useMemo(() => {
    const found = safeCategories.find(c => c.name === formData.category);
    return found ? (found.defaultTitles || []) : [];
  }, [formData.category, safeCategories]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const errors = validateTransactionFields(formData);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    const finalData = {
      ...formData,
      title: sanitizeText(formData.title),
      paymentMethod: normalizePaymentMethod(formData)
    };
    onSubmit(finalData);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        ref={modalRef}
        className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-emerald-400" />
          新增支出記帳
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <label className="block text-xs font-medium text-slate-400 mb-1">日期 (date)</label>
            <button
              type="button"
              onClick={() => setShowCalendar(prev => !prev)}
              className={`w-full bg-slate-950 border rounded-xl px-3 py-2 text-slate-200 text-sm focus:outline-none flex items-center justify-between ${
                fieldErrors.date ? 'border-rose-500' : 'border-slate-800 hover:border-indigo-500'
              }`}
            >
              <span>{formData.date}</span>
              <Calendar className="w-4 h-4 text-slate-500" />
            </button>
            {fieldErrors.date && <p className="text-[11px] text-rose-400 mt-1">{fieldErrors.date}</p>}
            {showCalendar && (
              <MiniCalendar
                selectedDate={formData.date}
                onSelect={(date) => {
                  setFormData({ ...formData, date });
                  setFieldErrors(prev => ({ ...prev, date: '' }));
                  setShowCalendar(false);
                }}
                onClose={() => setShowCalendar(false)}
              />
            )}
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
                value={formData.amount}
                onChange={(e) => {
                  setFormData({ ...formData, amount: e.target.value });
                  setFieldErrors(prev => ({ ...prev, amount: '' }));
                }}
                className={`w-full bg-slate-950 border rounded-xl pl-12 pr-3 py-2 text-slate-100 text-base font-bold focus:outline-none ${
                  fieldErrors.amount ? 'border-rose-500' : 'border-slate-800 focus:border-indigo-500'
                }`}
              />
            </div>
            {fieldErrors.amount && <p className="text-[11px] text-rose-400 mt-1">{fieldErrors.amount}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">類別 (category)</label>
            <select 
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
            >
              {safeCategories.length > 0 ? safeCategories.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              )) : (
                <option value={INITIAL_CATEGORIES[0].name}>{INITIAL_CATEGORIES[0].name}</option>
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">項目標題 (title)</label>
            <input 
              type="text"
              required
              maxLength={50}
              placeholder="請輸入或點選下方預設標題"
              value={formData.title}
              onChange={(e) => {
                setFormData({ ...formData, title: e.target.value });
                setFieldErrors(prev => ({ ...prev, title: '' }));
              }}
              className={`w-full bg-slate-950 border rounded-xl px-3 py-2 text-slate-200 text-sm focus:outline-none ${
                fieldErrors.title ? 'border-rose-500' : 'border-slate-800 focus:border-indigo-500'
              }`}
            />
            {fieldErrors.title && <p className="text-[11px] text-rose-400 mt-1">{fieldErrors.title}</p>}

            {currentCategoryTitles.length > 0 && (
              <div className="mt-2">
                <span className="text-[11px] text-slate-500 block mb-1">快速選取熱門標題：</span>
                <div className="flex flex-wrap gap-1.5">
                  {currentCategoryTitles.map((t, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setFormData(prev => ({ ...prev, title: t }))}
                      className="text-xs px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700/80 transition"
                    >
                      + {t}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">付款人 (payer)</label>
            <div className="grid grid-cols-2 gap-2">
              {PAYERS.map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setFormData({ ...formData, payer: p })}
                  className={`py-2 px-3 rounded-xl border text-sm font-semibold transition ${
                    formData.payer === p
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
              {PAYMENT_METHODS.map(pm => (
                <button
                  key={pm}
                  type="button"
                  onClick={() => setFormData({ ...formData, paymentMethod: pm, isCustomPayment: false })}
                  className={`py-1.5 px-3 rounded-xl border text-xs font-medium transition ${
                    !formData.isCustomPayment && formData.paymentMethod === pm
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
              value={formData.customPaymentMethod}
              onChange={(e) => {
                setFormData({ 
                  ...formData, 
                  customPaymentMethod: e.target.value,
                  isCustomPayment: true 
                });
                setFieldErrors(prev => ({ ...prev, customPaymentMethod: '' }));
              }}
              className={`w-full bg-slate-950 border rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none ${
                formData.isCustomPayment ? 'border-rose-500 bg-rose-500/10' : 'border-slate-800'
              } ${fieldErrors.customPaymentMethod ? 'border-rose-500' : ''}`}
            />
            {fieldErrors.customPaymentMethod && <p className="text-[11px] text-rose-400 mt-1">{fieldErrors.customPaymentMethod}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">備註 (note)</label>
            <input 
              type="text"
              maxLength={200}
              placeholder="可留空"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-2">
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-emerald-900/30 transition"
            >
              {loading ? '正在提交中...' : '確認新增記帳'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddTransactionModal;
