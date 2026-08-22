
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
        className="add-transaction-modal pixel-card bg-surface-warm max-w-md w-full p-6 relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted hover:text-ink">
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-ink mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-primary-dark" />
          新增支出記帳
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <label className="block text-lg font-medium text-muted mb-1">日期</label>
            <button
              type="button"
              onClick={() => setShowCalendar(prev => !prev)}
              className={`pixel-border-sm w-full bg-surface-soft border-2 rounded-pixel-sm px-3 py-2 text-ink text-sm focus:outline-none flex items-center justify-between ${
                fieldErrors.date ? 'border-danger' : 'border-ink hover:border-primary'
              }`}
            >
              <span>{formData.date}</span>
              <Calendar className="w-4 h-4 text-muted" />
            </button>
            {fieldErrors.date && <p className="text-[11px] text-danger mt-1">{fieldErrors.date}</p>}
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
            <label className="block text-lg font-medium text-muted mb-1">金額</label>
            <div className="pixel-border-sm relative p-0.5">
              <span className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-muted text-sm font-semibold">HK$</span>
              <input 
                type="number"
                step="1"
                required
                placeholder="0"
                value={formData.amount}
                onChange={(e) => {
                  setFormData({ ...formData, amount: e.target.value });
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
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="relative z-0 w-full bg-surface-soft border-0 rounded-none px-3 py-2 text-ink text-sm focus:outline-none focus:border-primary"
              >
                {safeCategories.length > 0 ? safeCategories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                )) : (
                  <option value={INITIAL_CATEGORIES[0].name}>{INITIAL_CATEGORIES[0].name}</option>
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-lg font-medium text-muted mb-1">項目標題</label>
            <div className="pixel-border-sm p-0.5">
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
                className="relative z-0 w-full bg-surface-soft border-0 rounded-none px-3 py-2 text-ink text-sm focus:outline-none focus:border-primary"
              />
            </div>
            {fieldErrors.title && <p className="text-[11px] text-danger mt-1">{fieldErrors.title}</p>}

            {currentCategoryTitles.length > 0 && (
              <div className="mt-2">
                <span className="text-[16.5px] text-muted-warm block mb-1">快速選取熱門標題：</span>
                <div className="flex flex-wrap gap-1.5">
                  {currentCategoryTitles.map((t, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setFormData(prev => ({ ...prev, title: t }))}
                      className="pixel-border-sm text-xs px-2 py-1 rounded-pixel-sm bg-surface-warm hover:bg-accent text-ink border-2 border-ink transition"
                    >
                      + {t}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-lg font-medium text-muted mb-1">付款人</label>
            <div className="grid grid-cols-2 gap-2">
              {PAYERS.map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setFormData({ ...formData, payer: p })}
                  className={`pixel-border-sm py-2 px-3 rounded-xl border text-sm font-semibold transition ${
                    formData.payer === p
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
              {PAYMENT_METHODS.map(pm => (
                <button
                  key={pm}
                  type="button"
                  onClick={() => setFormData({ ...formData, paymentMethod: pm, isCustomPayment: false })}
                  className={`pixel-border-sm py-1.5 px-3 rounded-xl border text-[15.6px] font-medium transition ${
                    !formData.isCustomPayment && formData.paymentMethod === pm
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
              value={formData.customPaymentMethod}
              onChange={(e) => {
                setFormData({ 
                  ...formData, 
                  customPaymentMethod: e.target.value,
                  isCustomPayment: true 
                });
                setFieldErrors(prev => ({ ...prev, customPaymentMethod: '' }));
              }}
              className={`pixel-border-sm w-full bg-surface-soft border-2 rounded-pixel-sm px-3 py-1.5 text-xs text-ink focus:outline-none ${
                formData.isCustomPayment ? 'border-danger bg-surface-warm' : 'border-ink'
              } ${fieldErrors.customPaymentMethod ? 'border-danger' : ''}`}
            />
            {fieldErrors.customPaymentMethod && <p className="text-[11px] text-danger mt-1">{fieldErrors.customPaymentMethod}</p>}
          </div>

          <div>
            <label className="block text-lg font-medium text-muted mb-1">備註</label>
            <div className="pixel-border-sm p-0.5">
              <input 
                type="text"
                maxLength={200}
                placeholder="可留空"
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                className="relative z-0 w-full bg-surface-soft border-0 rounded-none px-3 py-2 text-ink text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="pt-2">
            <button 
              type="submit"
              disabled={loading}
              className="pixel-button-primary w-full py-2.5"
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
