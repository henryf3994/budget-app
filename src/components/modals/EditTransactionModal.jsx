
import React, { useState, useRef } from 'react';
import { X, Edit3, Calendar } from 'lucide-react';
import { PAYERS, PAYMENT_METHODS, getPayerStyle, getPaymentMethodStyle } from '../../utils/constants.js';
import { useOnClickOutside } from '../../hooks/useOnClickOutside.js';
import { normalizePaymentMethod, sanitizeText, validateTransactionFields } from '../../utils/validation.js';
import MiniCalendar from '../MiniCalendar.jsx';

// =========================================================================
// 📁 src/components/modals/EditTransactionModal.jsx
// =========================================================================
function EditTransactionModal({ transaction, categories, onClose, onSubmit, loading }) {
  const safeCategories = Array.isArray(categories) ? categories : [];
  const [formData, setFormData] = useState(() => {
    const isCustomPayment = !!transaction?.paymentMethod && !PAYMENT_METHODS.includes(transaction.paymentMethod);

    return {
      ...transaction,
      paymentMethod: isCustomPayment ? PAYMENT_METHODS[0] : (transaction?.paymentMethod || PAYMENT_METHODS[0]),
      customPaymentMethod: isCustomPayment ? transaction.paymentMethod : '',
      isCustomPayment
    };
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [showCalendar, setShowCalendar] = useState(false);

  const modalRef = useRef(null);
  useOnClickOutside(modalRef, onClose);

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
        className="edit-transaction-modal pixel-card bg-surface-warm max-w-md w-full p-6 relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted hover:text-ink">
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-ink mb-4 flex items-center gap-2">
          <Edit3 className="w-5 h-5 text-primary-dark" />
          編輯支出紀錄
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <label className="block text-xs font-medium text-muted mb-1">日期</label>
            <button
              type="button"
              onClick={() => setShowCalendar(prev => !prev)}
              className={`pixel-border-sm w-full bg-surface-soft border-2 rounded-pixel-sm px-3 py-2 text-ink text-sm focus:outline-none flex items-center justify-between ${
                fieldErrors.date ? 'border-danger' : 'border-ink hover:border-primary'
              }`}
            >
              <span>{formData.date || ''}</span>
              <Calendar className="w-4 h-4 text-muted" />
            </button>
            {fieldErrors.date && <p className="text-[11px] text-danger mt-1">{fieldErrors.date}</p>}
            {showCalendar && (
              <MiniCalendar
                selectedDate={formData.date || ''}
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
            <label className="block text-xs font-medium text-muted mb-1">金額</label>
            <div className="pixel-border-sm relative p-0.5">
              <span className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-muted text-sm font-semibold">HK$</span>
              <input 
                type="number"
                step="0.01"
                required
                value={formData.amount || ''}
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
            <label className="block text-xs font-medium text-muted mb-1">類別</label>
            <div className="pixel-border-sm p-0.5">
              <select 
                value={formData.category || (safeCategories[0]?.name || '其他')}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="relative z-0 w-full bg-surface-soft border-0 rounded-none px-3 py-2 text-ink text-sm focus:outline-none focus:border-primary"
              >
                {safeCategories.length > 0 ? safeCategories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                )) : (
                  <option value="其他">其他</option>
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1">項目標題</label>
            <div className="pixel-border-sm p-0.5">
              <input 
                type="text"
                required
                maxLength={50}
                value={formData.title || ''}
                onChange={(e) => {
                  setFormData({ ...formData, title: e.target.value });
                  setFieldErrors(prev => ({ ...prev, title: '' }));
                }}
                className="relative z-0 w-full bg-surface-soft border-0 rounded-none px-3 py-2 text-ink text-sm focus:outline-none"
              />
            </div>
            {fieldErrors.title && <p className="text-[11px] text-danger mt-1">{fieldErrors.title}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1">付款人</label>
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
            <label className="block text-xs font-medium text-muted mb-1">付款方式</label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              {PAYMENT_METHODS.map(pm => (
                <button
                  key={pm}
                  type="button"
                  onClick={() => setFormData({ ...formData, paymentMethod: pm, isCustomPayment: false })}
                  className={`pixel-border-sm py-1.5 px-3 rounded-xl border text-xs font-medium transition ${
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
              value={formData.customPaymentMethod || ''}
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
            <label className="block text-xs font-medium text-muted mb-1">備註</label>
            <div className="pixel-border-sm p-0.5">
              <input 
                type="text"
                maxLength={200}
                value={formData.note || ''}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                className="relative z-0 w-full bg-surface-soft border-0 rounded-none px-3 py-2 text-ink text-sm focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex gap-2">
            <button 
              type="button"
              onClick={onClose}
              className="pixel-button-accent w-1/2 py-2.5"
            >
              取消
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="pixel-button-primary w-1/2 py-2.5"
            >
              儲存修改
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditTransactionModal;